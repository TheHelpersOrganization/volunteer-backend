import { toErrorObject } from '@app/common/filters';
import { AppLogger } from '@app/common/logger';
import { RequestContext } from '@app/common/request-context';
import { AbstractService } from '@app/common/services';
import { OrganizationService } from '@app/organization/services';
import { PrismaService } from '@app/prisma';
import { ProfileOutputDto, getProfileBasicSelect } from '@app/profile/dtos';
import { ProfileService, ProfileSkillService } from '@app/profile/services';
import { ShiftSkillService } from '@app/shift-skill/services';
import { ShiftStatus } from '@app/shift/constants';
import { ShiftOutputDto } from '@app/shift/dtos';
import {
  InvalidStatusException,
  ShiftCheckInTimeLimitExceededException,
  ShiftCheckOutTimeLimitExceededException,
  ShiftHasEndedException,
  ShiftHasNotYetEndedException,
  ShiftHasNotYetStartedException,
  ShiftHasStartedException,
  ShiftIsFullException,
  ShiftNotFoundException,
} from '@app/shift/exceptions';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Location, Prisma, Shift, VolunteerShift } from '@prisma/client';
import dayjs from 'dayjs';
import { getDistance } from 'geolib';
import { max, min } from 'lodash';
import { ShiftVolunteerStatus } from '../constants';
import {
  ApproveManyShiftVolunteer,
  CreateShiftVolunteerInputDto,
  GetShiftVolunteerQueryDto,
  RateActivityInputDto,
  RejectManyShiftVolunteer,
  RemoveManyShiftVolunteer,
  ReviewShiftVolunteerInputDto,
  ShiftVolunteerInclude,
  ShiftVolunteerOutputDto,
  UpdateManyShiftVolunteerStatusOutputDto,
  UpdateShiftVolunteerStatus,
  VerifyCheckInInputDto,
  VerifyVolunteerCheckInByIdInputDto,
} from '../dtos';
import { ShiftVolunteerReviewedEvent } from '../events';
import {
  CheckInHasAlreadyBeenVerified,
  CheckOutHasAlreadyBeenVerified,
  ShiftIsOverlappingException,
  VolunteerHasAlreadyCheckedInException,
  VolunteerHasAlreadyCheckedOutException,
  VolunteerHasAlreadyJoinedShiftException,
  VolunteerHasNotCheckedInException,
  VolunteerHasNotJoinedShiftException,
  VolunteerNotFoundException,
  VolunteerStatusNotApprovedException,
} from '../exception';

@Injectable()
export class ShiftVolunteerService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
    private readonly profileSkillService: ProfileSkillService,
    private readonly organizationService: OrganizationService,
    private readonly shiftSkillService: ShiftSkillService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super(logger);
  }

  async getShiftVolunteers(
    context: RequestContext,
    query: GetShiftVolunteerQueryDto,
  ) {
    this.logCaller(context, this.getShiftVolunteers);

    const include = this.getShiftVolunteerInclude(query);
    const res = await this.prisma.volunteerShift.findMany({
      where: this.getShiftVolunteerFilter(query, context.account.id),
      take: query.limit,
      skip: query.offset,
      cursor:
        query.cursor != null
          ? {
              id: query.cursor,
            }
          : undefined,
      include: include,
    });
    const pendingVolunteers = res.filter(
      (v) => v.status === ShiftVolunteerStatus.Pending,
    );
    const pendingAccountIds = pendingVolunteers.map((v) => v.accountId);
    const pendingOrApprovedAccountIds = res
      .filter(
        (v) =>
          v.status === ShiftVolunteerStatus.Pending ||
          v.status === ShiftVolunteerStatus.Approved,
      )
      .map((v) => v.accountId);

    let totalPending: number | undefined = undefined;
    let totalApproved: number | undefined = undefined;
    if (query.status?.includes(ShiftVolunteerStatus.Approved) == true) {
      totalApproved = await this.prisma.volunteerShift.count({
        where: this.getShiftVolunteerCountFilter(
          query,
          ShiftVolunteerStatus.Approved,
        ),
      });
    }
    if (query.status?.includes(ShiftVolunteerStatus.Pending) == true) {
      totalPending = await this.prisma.volunteerShift.count({
        where: this.getShiftVolunteerCountFilter(
          query,
          ShiftVolunteerStatus.Pending,
        ),
      });
    }

    let volunteers:
      | (VolunteerShift & {
          shift: Shift & {
            shiftLocations: {
              location: Location;
            }[];
          };
        })[]
      | undefined;
    let hasOverlappingShift: { [key: number]: boolean | undefined } = {};
    let hasTravelingConstrainedShift: { [key: number]: boolean | undefined } =
      {};
    if (
      query.shiftId &&
      query.include?.includes(ShiftVolunteerInclude.OverlappingCheck) == true
    ) {
      hasOverlappingShift = (
        await this.checkOverlapShifts(context, query.shiftId, pendingAccountIds)
      ).overlaps;
    }
    if (
      query.shiftId &&
      query.include?.includes(
        ShiftVolunteerInclude.TravelingConstrainedCheck,
      ) == true
    ) {
      hasTravelingConstrainedShift = (
        await this.checkTravelingConstrainedShifts(
          context,
          query.shiftId,
          pendingOrApprovedAccountIds,
        )
      ).travelingConstrained;
    }

    let profiles: ProfileOutputDto[] | undefined = undefined;
    if (query.include?.includes(ShiftVolunteerInclude.Profile) == true) {
      const accountIds = res.map((v) => v.accountId);
      profiles = await this.profileService.getProfiles(context, {
        ids: accountIds,
        select: getProfileBasicSelect,
      });
    }

    return this.extendedOutputArray(
      ShiftVolunteerOutputDto,
      res.map((v) => ({
        ...v,
        profile: profiles?.find((p) => p.id === v.accountId),
        hasOverlappingShift: hasOverlappingShift[v.accountId],
        hasTravelingConstrainedShift: hasTravelingConstrainedShift[v.accountId],
      })),
      {
        totalPending,
        totalApproved,
        count: res.length,
      },
    );
  }

  getShiftVolunteerFilter(
    query: GetShiftVolunteerQueryDto,
    requesterId: number,
  ): Prisma.VolunteerShiftWhereInput {
    const filter: Prisma.VolunteerShiftWhereInput = {};

    if (query.id) {
      filter.id = { in: query.id };
    }

    if (query.shiftId) {
      filter.shiftId = query.shiftId;
    }

    if (query.activityId) {
      filter.shift = { activityId: query.activityId };
    }

    if (query.active) {
      filter.active = query.active;
    }

    if (query.mine) {
      filter.accountId = requesterId;
    }

    if (query.status) {
      filter.status = { in: query.status };
    }

    if (query.name) {
      filter.account = {
        OR: [
          { email: { contains: query.name, mode: 'insensitive' } },
          {
            profile: {
              OR: [
                { username: { contains: query.name, mode: 'insensitive' } },
                { firstName: { contains: query.name, mode: 'insensitive' } },
                { lastName: { contains: query.name, mode: 'insensitive' } },
              ],
            },
          },
        ],
      };
    }

    if (query.meetSkillRequirements) {
      filter.meetSkillRequirements = query.meetSkillRequirements;
    }

    return filter;
  }

  getShiftVolunteerCountFilter(
    query: GetShiftVolunteerQueryDto,
    status: ShiftVolunteerStatus,
  ): Prisma.VolunteerShiftWhereInput {
    const filter: Prisma.VolunteerShiftWhereInput = {};

    if (query.shiftId) {
      filter.shiftId = query.shiftId;
    }

    if (query.activityId) {
      filter.shift = { activityId: query.activityId };
    }

    if (query.status) {
      filter.status = status;
    }

    return filter;
  }

  getShiftVolunteerInclude(query: GetShiftVolunteerQueryDto) {
    const include: Prisma.VolunteerShiftInclude = {};
    if (query.include?.includes(ShiftVolunteerInclude.Shift) == true) {
      include.shift = true;
    }
    if (Object.keys(include).length === 0) {
      return undefined;
    }
    return include;
  }

  async checkOverlapShifts(
    context: RequestContext,
    shiftId: number,
    accountIds: number[],
    options?: {
      useShift?: Shift;
    },
  ) {
    const res: { [key: number]: boolean | undefined } = {};
    const shift =
      options?.useShift ??
      (await this.prisma.shift.findUnique({
        where: {
          id: shiftId,
        },
      }));
    if (shift == null) {
      throw new ShiftNotFoundException();
    }
    const volunteers = await this.prisma.volunteerShift.findMany({
      where: {
        accountId: {
          in: accountIds,
        },
        active: true,
        status: ShiftVolunteerStatus.Pending,
      },
      include: {
        shift: true,
      },
    });
    for (const accountId of accountIds) {
      const accountVolunteers = volunteers.filter(
        (v) => v.accountId === accountId,
      );
      const overlap = accountVolunteers.some((v) => {
        return (
          v.shift.startTime < shift.endTime &&
          v.shift.endTime > shift.startTime &&
          v.shiftId !== shift.id
        );
      });
      res[accountId] = overlap;
    }
    return {
      shift: shift,
      overlaps: res,
    };
  }

  async checkTravelingConstrainedShifts(
    context: RequestContext,
    shiftId: number,
    accountIds: number[],
    options?: {
      useShift?: Shift & {
        shiftLocations: {
          location: Location;
        }[];
      };
    },
  ) {
    const res: { [key: number]: boolean | undefined } = {};
    const shift =
      options?.useShift ??
      (await this.prisma.shift.findUnique({
        where: {
          id: shiftId,
        },
        include: {
          shiftLocations: {
            include: {
              location: true,
            },
          },
        },
      }));
    if (shift == null) {
      throw new ShiftNotFoundException();
    }
    const volunteers = await this.prisma.volunteerShift.findMany({
      where: {
        accountId: context.account.id,
        active: true,
        status: ShiftVolunteerStatus.Approved,
      },
      include: {
        shift: {
          include: {
            shiftLocations: {
              include: {
                location: true,
              },
            },
          },
        },
      },
    });
    for (const accountId of accountIds) {
      const accountVolunteers = volunteers.filter(
        (v) => v.accountId === accountId,
      );
      for (const v of accountVolunteers) {
        if (v.shiftId === shift.id) {
          continue;
        }
        // If shift is overlapping, skip
        if (
          v.shift.startTime < shift.endTime &&
          v.shift.endTime > shift.startTime
        ) {
          continue;
        }
        // Time available to travel
        const startTime: Date = max([v.shift.startTime, shift.startTime])!;
        const endTime: Date = min([v.shift.endTime, shift.endTime])!;
        const durationInSeconds =
          (startTime.getTime() - endTime.getTime()) / 1000;

        const volunteerShift = v.shift;
        const location = volunteerShift.shiftLocations[0].location;
        const lat1 = location.latitude;
        const long1 = location.longitude;
        if (lat1 == null || long1 == null) continue;
        const lat2 = shift.shiftLocations[0].location.latitude;
        const long2 = shift.shiftLocations[0].location.longitude;
        if (lat2 == null || long2 == null) continue;

        const distanceInMeters = getDistance(
          { latitude: lat1, longitude: long1 },
          { latitude: lat2, longitude: long2 },
        );
        // Speed in m/s
        const speedInMetersPerSecond = distanceInMeters / durationInSeconds;

        // If speed is greater than 18 m/, then maybe we can't make it
        if (speedInMetersPerSecond > 18) {
          res[accountId] = true;
          break;
        }
      }
    }
    return {
      shift: shift,
      travelingConstrained: res,
    };
  }

  async getApprovedByActivityId(
    context: RequestContext,
    activityId: number,
  ): Promise<ShiftVolunteerOutputDto[]> {
    this.logCaller(context, this.getApprovedByActivityId);
    const res = await this.prisma.volunteerShift.findMany({
      where: {
        shift: {
          activityId: activityId,
        },
        status: ShiftVolunteerStatus.Approved,
      },
    });
    return this.outputArray(ShiftVolunteerOutputDto, res);
  }

  async getByShiftId(
    context: RequestContext,
    shiftId: number,
  ): Promise<ShiftVolunteerOutputDto[]> {
    this.logCaller(context, this.getByShiftId);
    const res = await this.prisma.volunteerShift.findMany({
      where: {
        shiftId: shiftId,
      },
    });

    return this.outputArray(ShiftVolunteerOutputDto, res);
  }

  async getMe(context: RequestContext): Promise<ShiftVolunteerOutputDto[]> {
    this.logCaller(context, this.getMe);
    const res = await this.prisma.volunteerShift.findMany({
      where: {
        accountId: context.account.id,
      },
    });
    return this.outputArray(ShiftVolunteerOutputDto, res);
  }

  async getById(
    context: RequestContext,
    id: number,
  ): Promise<ShiftVolunteerOutputDto | null> {
    this.logCaller(context, this.getById);
    const res = await this.prisma.volunteerShift.findUnique({
      where: {
        id: id,
      },
    });
    return this.output(ShiftVolunteerOutputDto, res);
  }

  async join(
    context: RequestContext,
    shiftId: number,
  ): Promise<ShiftVolunteerOutputDto> {
    this.logCaller(context, this.join);

    const shift = await this.prisma.shift.findUnique({
      where: {
        id: shiftId,
      },
      include: {
        shiftVolunteers: true,
      },
    });

    if (shift == null) {
      throw new ShiftNotFoundException();
    }

    if (shift.status !== ShiftStatus.Pending) {
      throw new ShiftHasStartedException();
    }

    if (shift.availableSlots != null && shift.availableSlots <= 0) {
      throw new ShiftIsFullException();
    }

    // Account volunteers
    const volunteers = await this.prisma.volunteerShift.findMany({
      where: {
        accountId: context.account.id,
        active: true,
      },
      include: {
        shift: true,
      },
    });
    const approved = volunteers.filter(
      (v) => v.status === ShiftVolunteerStatus.Approved,
    );
    const volunteer = volunteers.find((v) => v.shiftId === shiftId);
    if (
      volunteer != null &&
      (volunteer.status === ShiftVolunteerStatus.Pending ||
        volunteer.status === ShiftVolunteerStatus.Approved)
    ) {
      throw new VolunteerHasAlreadyJoinedShiftException();
    }

    // Check if new shift time overlaps with pending or approved shifts
    const hasSomeOverlap = approved.some((v) => {
      return (
        shift.startTime < v.shift.endTime &&
        shift.endTime > v.shift.startTime &&
        v.shiftId !== shift.id
      );
    });
    if (hasSomeOverlap) {
      throw new ShiftIsOverlappingException();
    }

    const res = this.prisma.$transaction(async (tx) => {
      // Mark other volunteer shifts as inactive
      await tx.volunteerShift.updateMany({
        where: {
          accountId: context.account.id,
          shiftId: shiftId,
          active: true,
        },
        data: {
          active: false,
        },
      });
      const res = await tx.volunteerShift.create({
        data: {
          accountId: context.account.id,
          status: ShiftVolunteerStatus.Pending,
          shiftId: shiftId,
          meetSkillRequirements: await this.checkMeetSkillRequirements(
            context,
            context.account.id,
            shiftId,
          ),
        },
      });
      return res;
    });

    return this.output(ShiftVolunteerOutputDto, res);
  }

  async cancelJoin(
    context: RequestContext,
    shiftId: number,
  ): Promise<ShiftVolunteerOutputDto> {
    this.logCaller(context, this.cancelJoin);

    const shift = await this.prisma.shift.findUnique({
      where: {
        id: shiftId,
      },
    });
    if (shift == null) {
      throw new ShiftNotFoundException();
    }

    const shiftVolunteer = await this.prisma.volunteerShift.findFirst({
      where: {
        shiftId: shiftId,
        accountId: context.account.id,
        status: ShiftVolunteerStatus.Pending,
        active: true,
      },
    });
    if (shiftVolunteer == null) {
      throw new InvalidStatusException();
    }

    const res = this.prisma.$transaction(async (tx) => {
      const res = await tx.volunteerShift.update({
        where: {
          id: shiftVolunteer.id,
        },
        data: {
          status: ShiftVolunteerStatus.Cancelled,
        },
      });

      return res;
    });

    return this.output(ShiftVolunteerOutputDto, res);
  }

  async leave(
    context: RequestContext,
    shiftId: number,
  ): Promise<ShiftVolunteerOutputDto> {
    this.logCaller(context, this.leave);
    const shift = await this.prisma.shift.findFirst({
      where: {
        id: shiftId,
      },
    });
    if (shift == null) {
      throw new ShiftNotFoundException();
    }
    const shiftVolunteer = await this.prisma.volunteerShift.findFirst({
      where: {
        shiftId: shiftId,
        accountId: context.account.id,
        status: ShiftVolunteerStatus.Approved,
        active: true,
      },
    });
    if (shiftVolunteer == null) {
      throw new InvalidStatusException();
    }

    if (shift.status !== ShiftStatus.Pending) {
      throw new ShiftHasStartedException();
    }

    const res = this.prisma.$transaction(async (tx) => {
      if (shift.numberOfParticipants != null) {
        await tx.shift.update({
          where: {
            id: shiftId,
          },
          data: {
            joinedParticipants: {
              decrement: 1,
            },
            availableSlots: {
              increment: 1,
            },
          },
        });
      } else {
        await tx.shift.update({
          where: {
            id: shiftId,
          },
          data: {
            joinedParticipants: {
              decrement: 1,
            },
          },
        });
      }
      const res = await tx.volunteerShift.update({
        where: {
          id: shiftVolunteer.id,
        },
        data: {
          status: ShiftVolunteerStatus.Left,
        },
      });
      return res;
    });

    return this.output(ShiftVolunteerOutputDto, res);
  }

  async create(
    context: RequestContext,
    shiftId: number,
    dto: CreateShiftVolunteerInputDto,
  ): Promise<ShiftVolunteerOutputDto> {
    this.logCaller(context, this.create);

    const res = await this.prisma.volunteerShift.create({
      data: {
        ...dto,
        status: ShiftVolunteerStatus.Pending,
        shiftId: shiftId,
      },
    });

    return this.output(ShiftVolunteerOutputDto, res);
  }

  async review(
    context: RequestContext,
    shiftId: number,
    id: number,
    dto: ReviewShiftVolunteerInputDto,
  ): Promise<ShiftVolunteerOutputDto> {
    this.logCaller(context, this.review);

    const shift = await this.prisma.shift.findUnique({
      where: {
        id: shiftId,
      },
    });
    if (shift == null) {
      throw new ShiftNotFoundException();
    }
    if (shift.status !== ShiftStatus.Completed) {
      throw new ShiftHasNotYetEndedException();
    }

    const shiftVolunteer = await this.prisma.volunteerShift.findUnique({
      where: {
        id: id,
        shiftId: shiftId,
        status: ShiftVolunteerStatus.Approved,
        active: true,
      },
    });
    if (shiftVolunteer == null) {
      throw new InvalidStatusException();
    }

    const prev = this.output(ShiftVolunteerOutputDto, shiftVolunteer);

    const res = await this.prisma.volunteerShift.update({
      where: {
        id: id,
      },
      data: {
        ...dto,
        reviewerId: context.account.id,
      },
    });

    const shiftOutput = this.output(ShiftOutputDto, shift);
    const output = this.output(ShiftVolunteerOutputDto, res);

    const event = new ShiftVolunteerReviewedEvent(
      context,
      shiftOutput,
      prev,
      output,
    );

    await this.profileSkillService.onShiftVolunteerReviewed(event);
    await this.organizationService.onShiftVolunteerReviewed(event);
    await this.updateMeetSkillRequirements(context, event);

    this.eventEmitter.emit(ShiftVolunteerReviewedEvent.eventName, event);

    return output;
  }

  async checkMeetSkillRequirements(
    context: RequestContext,
    accountId: number,
    shiftId: number,
  ) {
    this.logCaller(context, this.checkMeetSkillRequirements);

    const profileSkills = await this.prisma.profileSkill.findMany({
      where: {
        profileId: accountId,
      },
    });
    const requirements = await this.prisma.shiftSkill.findMany({
      where: {
        shiftId: shiftId,
      },
    });

    let meetSkillRequirements = true;

    for (const requirement of requirements) {
      const existingProfileSkill = profileSkills.find(
        (es) => es.skillId === requirement.skillId,
      );
      // No profile skill found, mark as not meet skill requirements
      if (existingProfileSkill == null) {
        meetSkillRequirements = false;
        break;
      }
      // Profile skill hours is less than requirement, mark as not meet skill requirements
      if (existingProfileSkill.hours < requirement.hours) {
        meetSkillRequirements = false;
        break;
      }
    }

    return meetSkillRequirements;
  }

  async updateMeetSkillRequirements(
    context: RequestContext,
    event: ShiftVolunteerReviewedEvent,
  ) {
    this.logCaller(context, this.updateMeetSkillRequirements);

    const shiftVolunteer = event.next;
    const shiftVolunteers = await this.prisma.volunteerShift.findMany({
      where: {
        id: {
          not: shiftVolunteer.id,
        },
        accountId: shiftVolunteer.accountId,
        shift: {
          status: { not: ShiftStatus.Completed },
        },
        status: {
          in: [ShiftVolunteerStatus.Pending, ShiftVolunteerStatus.Approved],
        },
      },
    });
    const profileSkills = await this.prisma.profileSkill.findMany({
      where: {
        profileId: shiftVolunteer.accountId,
      },
    });
    const shiftSkills = await this.prisma.shiftSkill.findMany({
      where: {
        shiftId: { in: shiftVolunteers.map((sv) => sv.shiftId) },
      },
    });
    const meet: number[] = [];
    for (const shiftVolunteer of shiftVolunteers) {
      const requirements = shiftSkills.filter(
        (ss) => ss.shiftId === shiftVolunteer.shiftId,
      );
      let meetSkillRequirements = true;
      for (const requirement of requirements) {
        const existingProfileSkill = profileSkills.find(
          (es) => es.skillId === requirement.skillId,
        );
        // No profile skill found, mark as not meet skill requirements
        if (existingProfileSkill == null) {
          meetSkillRequirements = false;
          break;
        }
        // Profile skill hours is less than requirement, mark as not meet skill requirements
        if (existingProfileSkill.hours < requirement.hours) {
          meetSkillRequirements = false;
          break;
        }
      }
      if (meetSkillRequirements) {
        meet.push(shiftVolunteer.id);
      }
    }
    // If meet skill requirements, update meetSkillRequirements to true
    // Otherwise, keep it as false
    await this.prisma.volunteerShift.updateMany({
      where: {
        id: {
          in: meet,
        },
      },
      data: {
        meetSkillRequirements: true,
      },
    });
  }

  async approveOrReject(
    context: RequestContext,
    shiftId: number,
    id: number,
    dto: UpdateShiftVolunteerStatus,
  ): Promise<ShiftVolunteerOutputDto> {
    this.logCaller(context, this.approveOrReject);

    const s = await this.prisma.shift.findUnique({
      where: {
        id: shiftId,
      },
    });
    const shift = this.validateShiftBeforeApproveOrRejectOrRemove(s);

    const volunteers = await this.prisma.volunteerShift.findMany({
      where: {
        accountId: context.account.id,
        active: true,
      },
      include: {
        shift: true,
      },
    });
    const approvedVolunteers = volunteers.filter(
      (v) => v.status === ShiftVolunteerStatus.Approved,
    );
    const shiftVolunteer = volunteers.find((v) => v.id === id);
    if (shiftVolunteer == null) {
      throw new InvalidStatusException();
    }
    if (
      dto.status === ShiftVolunteerStatus.Approved &&
      shiftVolunteer.status != ShiftVolunteerStatus.Pending &&
      shiftVolunteer.status != ShiftVolunteerStatus.Rejected &&
      shiftVolunteer.status != ShiftVolunteerStatus.Removed
    ) {
      throw new InvalidStatusException();
    }
    // Check if any other shift is overlapping
    const hasSomeOverlap = approvedVolunteers.some((v) => {
      shift.startTime < v.shift.endTime && shift.endTime > v.shift.startTime;
    });
    if (hasSomeOverlap) {
      throw new ShiftIsOverlappingException();
    }
    if (
      dto.status === ShiftVolunteerStatus.Rejected &&
      shiftVolunteer.status != ShiftVolunteerStatus.Pending
    ) {
      throw new InvalidStatusException();
    }

    const res = this.prisma.$transaction(async (tx) => {
      if (dto.status === ShiftVolunteerStatus.Approved) {
        if (shift.numberOfParticipants != null) {
          await tx.shift.update({
            where: {
              id: shiftId,
            },
            data: {
              joinedParticipants: {
                increment: 1,
              },
              availableSlots: {
                decrement: 1,
              },
            },
          });
        } else {
          await tx.shift.update({
            where: {
              id: shiftId,
            },
            data: {
              joinedParticipants: {
                increment: 1,
              },
            },
          });
        }

        // Cancel other overlapping pending shifts
        await tx.volunteerShift.updateMany({
          where: {
            accountId: context.account.id,
            shift: {
              id: {
                not: shiftId,
              },
              startTime: {
                lt: shift.endTime,
              },
              endTime: {
                gt: shift.startTime,
              },
            },
            status: ShiftVolunteerStatus.Pending,
            active: true,
          },
          data: {
            status: ShiftVolunteerStatus.Cancelled,
          },
        });
      }
      const res = await tx.volunteerShift.update({
        where: {
          id: id,
        },
        data: {
          status: dto.status,
          censorId: context.account.id,
        },
      });
      return res;
    });

    return this.output(ShiftVolunteerOutputDto, res);
  }

  async approveMany(
    context: RequestContext,
    shiftId: number,
    dto: ApproveManyShiftVolunteer,
  ) {
    this.logCaller(context, this.approveMany);

    const s = await this.prisma.shift.findUnique({
      where: {
        id: shiftId,
      },
    });
    this.validateShiftBeforeApproveOrRejectOrRemove(s);

    const res: UpdateManyShiftVolunteerStatusOutputDto = {
      success: [],
      error: [],
    };

    for (const id of dto.volunteerIds) {
      try {
        const volunteer = await this.approveOrReject(context, shiftId, id, {
          status: ShiftVolunteerStatus.Approved,
        });
        res.success.push(volunteer);
      } catch (ex) {
        res.error.push({
          id: id,
          error: toErrorObject(ex),
        });
      }
    }

    return this.output(UpdateManyShiftVolunteerStatusOutputDto, res);
  }

  async rejectMany(
    context: RequestContext,
    shiftId: number,
    dto: RejectManyShiftVolunteer,
  ) {
    this.logCaller(context, this.remove);

    const s = await this.prisma.shift.findUnique({
      where: {
        id: shiftId,
      },
    });
    this.validateShiftBeforeApproveOrRejectOrRemove(s);

    const res: UpdateManyShiftVolunteerStatusOutputDto = {
      success: [],
      error: [],
    };

    for (const id of dto.volunteerIds) {
      try {
        const volunteer = await this.approveOrReject(context, shiftId, id, {
          status: ShiftVolunteerStatus.Rejected,
        });
        res.success.push(volunteer);
      } catch (ex) {
        res.error.push({
          id: id,
          error: toErrorObject(ex),
        });
      }
    }
  }

  async remove(
    context: RequestContext,
    shiftId: number,
    id: number,
  ): Promise<ShiftVolunteerOutputDto> {
    this.logCaller(context, this.remove);

    const s = await this.prisma.shift.findUnique({
      where: {
        id: shiftId,
      },
    });
    const shift = this.validateShiftBeforeApproveOrRejectOrRemove(s);

    const shiftVolunteer = await this.prisma.volunteerShift.findUnique({
      where: {
        id: id,
        shiftId: shiftId,
        active: true,
      },
    });
    if (shiftVolunteer == null) {
      throw new VolunteerHasNotJoinedShiftException();
    }
    if (shiftVolunteer.status != ShiftVolunteerStatus.Approved) {
      throw new VolunteerStatusNotApprovedException();
    }

    const res = this.prisma.$transaction(async (tx) => {
      const input: Prisma.ShiftUpdateInput =
        shift.numberOfParticipants != null
          ? {
              joinedParticipants: {
                decrement: 1,
              },
              availableSlots: {
                increment: 1,
              },
            }
          : {
              joinedParticipants: {
                decrement: 1,
              },
            };
      await tx.shift.update({
        where: {
          id: shiftId,
        },
        data: input,
      });

      const res = await tx.volunteerShift.update({
        where: {
          id: shiftVolunteer.id,
        },
        data: {
          status: ShiftVolunteerStatus.Removed,
          censorId: context.account.id,
        },
      });
      return res;
    });

    return this.output(ShiftVolunteerOutputDto, res);
  }

  async removeMany(
    context: RequestContext,
    shiftId: number,
    dto: RemoveManyShiftVolunteer,
  ) {
    this.logCaller(context, this.removeMany);

    const s = await this.prisma.shift.findUnique({
      where: {
        id: shiftId,
      },
    });
    this.validateShiftBeforeApproveOrRejectOrRemove(s);

    const res: UpdateManyShiftVolunteerStatusOutputDto = {
      success: [],
      error: [],
    };

    for (const id of dto.volunteerIds) {
      try {
        const volunteer = await this.remove(context, shiftId, id);
        res.success.push(volunteer);
      } catch (ex) {
        res.error.push({
          id: id,
          error: toErrorObject(ex),
        });
      }
    }

    return this.output(UpdateManyShiftVolunteerStatusOutputDto, res);
  }

  validateShiftBeforeApproveOrRejectOrRemove(shift: Shift | null): Shift {
    if (shift == null) {
      throw new ShiftNotFoundException();
    }
    if (shift.status === ShiftStatus.Completed) {
      throw new ShiftHasEndedException();
    }
    return shift;
  }

  async checkIn(
    context: RequestContext,
    shiftId: number,
  ): Promise<ShiftVolunteerOutputDto> {
    this.logCaller(context, this.checkIn);
    const shift = await this.prisma.shift.findUnique({
      where: {
        id: shiftId,
      },
    });
    if (shift == null) {
      throw new ShiftNotFoundException();
    }
    const volunteer = await this.prisma.volunteerShift.findFirst({
      where: {
        shiftId: shiftId,
        accountId: context.account.id,
        status: ShiftVolunteerStatus.Approved,
        active: true,
      },
    });
    if (volunteer == null) {
      throw new VolunteerNotFoundException();
    }
    this.checkCanCheckIn(shift, volunteer);
    const res = await this.prisma.volunteerShift.update({
      where: {
        id: volunteer.id,
      },
      data: {
        checkedIn: true,
        checkInAt: new Date(),
      },
    });
    return this.output(ShiftVolunteerOutputDto, res);
  }

  checkCanCheckIn(
    shift: Shift,
    volunteer: VolunteerShift,
    throwException = true,
  ) {
    if (volunteer.isCheckInVerified != null) {
      if (throwException) {
        throw new CheckInHasAlreadyBeenVerified();
      }
      return false;
    }
    if (volunteer.checkedIn) {
      if (throwException) {
        throw new VolunteerHasAlreadyCheckedInException();
      }
      return false;
    }
    if (dayjs(shift.startTime).isAfter(dayjs())) {
      if (throwException) {
        throw new ShiftHasNotYetStartedException();
      }
      return false;
    }
    if (dayjs(shift.endTime).isBefore(dayjs())) {
      if (throwException) {
        throw new ShiftHasEndedException();
      }
      return false;
    }
    if (
      shift.checkInMinutesLimit &&
      dayjs(shift.startTime)
        .add(shift.checkInMinutesLimit ?? 0, 'minute')
        .isBefore(dayjs())
    ) {
      if (throwException) {
        throw new ShiftCheckInTimeLimitExceededException();
      }
      return false;
    }
    return true;
  }

  async checkOut(
    context: RequestContext,
    shiftId: number,
  ): Promise<ShiftVolunteerOutputDto> {
    this.logCaller(context, this.checkOut);
    const shift = await this.prisma.shift.findUnique({
      where: {
        id: shiftId,
      },
    });
    if (shift == null) {
      throw new ShiftNotFoundException();
    }
    const volunteer = await this.prisma.volunteerShift.findFirst({
      where: {
        shiftId: shiftId,
        accountId: context.account.id,
        status: ShiftVolunteerStatus.Approved,
        active: true,
      },
    });
    if (volunteer == null) {
      throw new VolunteerNotFoundException();
    }
    this.checkCanCheckOut(shift, volunteer);
    const res = await this.prisma.volunteerShift.update({
      where: {
        id: volunteer.id,
      },
      data: {
        checkedOut: true,
        checkOutAt: new Date(),
      },
    });
    return this.output(ShiftVolunteerOutputDto, res);
  }

  checkCanCheckOut(
    shift: Shift,
    volunteer: VolunteerShift,
    throwException = true,
  ) {
    if (volunteer.isCheckOutVerified != null) {
      if (throwException) {
        throw new CheckOutHasAlreadyBeenVerified();
      }
      return false;
    }
    if (!volunteer.checkedIn) {
      if (throwException) {
        throw new VolunteerHasNotCheckedInException();
      }
      return false;
    }
    if (volunteer.checkedOut) {
      if (throwException) {
        throw new VolunteerHasAlreadyCheckedOutException();
      }
      return false;
    }

    // if (dayjs(shift.endTime).isAfter(dayjs())) {
    //   if (throwException) {
    //     throw new ShiftHasNotYetEndedException();
    //   }
    //   return false;
    // }
    if (
      shift.checkOutMinutesLimit &&
      dayjs(shift.endTime)
        .add(shift.checkOutMinutesLimit ?? 0, 'minute')
        .isBefore(dayjs())
    ) {
      if (throwException) {
        throw new ShiftCheckOutTimeLimitExceededException();
      }
      return false;
    }
    return true;
  }

  async verifyCheckInMany(
    context: RequestContext,
    shiftId: number,
    dto: VerifyCheckInInputDto,
  ) {
    this.logCaller(context, this.verifyCheckInMany);
    const shift = await this.prisma.shift.findUnique({
      where: {
        id: shiftId,
      },
    });
    if (shift == null) {
      throw new ShiftNotFoundException();
    }
    const res = await this.prisma.$transaction(async (tx) => {
      const res: UpdateManyShiftVolunteerStatusOutputDto = {
        success: [],
        error: [],
      };
      for (const volunteer of dto.volunteers) {
        try {
          const r = await tx.volunteerShift.update({
            where: {
              id: volunteer.id,
              shiftId: shiftId,
              status: ShiftVolunteerStatus.Approved,
              active: true,
            },
            data: {
              isCheckInVerified: volunteer.checkedIn,
              isCheckOutVerified: volunteer.checkedOut,
              checkInOutVerifierId: context.account.id,
            },
          });
          const output = this.output(ShiftVolunteerOutputDto, r);
          res.success.push(output);
        } catch (err) {
          res.error.push({
            id: volunteer.id,
            error: toErrorObject(err),
          });
        }
      }
      return res;
    });
    return this.output(UpdateManyShiftVolunteerStatusOutputDto, res);
  }

  async verifyCheckInById(
    context: RequestContext,
    shiftId: number,
    id: number,
    dto: VerifyVolunteerCheckInByIdInputDto,
  ) {
    this.logCaller(context, this.verifyCheckInById);
    const shift = await this.prisma.shift.findUnique({
      where: {
        id: shiftId,
      },
    });
    if (shift == null) {
      throw new ShiftNotFoundException();
    }
    const volunteer = await this.prisma.volunteerShift.findUnique({
      where: {
        id: id,
        shiftId: shiftId,
        status: ShiftVolunteerStatus.Approved,
        active: true,
      },
    });
    if (volunteer == null) {
      throw new VolunteerNotFoundException();
    }
    const res = await this.prisma.volunteerShift.update({
      where: {
        id: id,
      },
      data: {
        isCheckInVerified: dto.checkedIn,
        isCheckOutVerified: dto.checkedOut,
        checkInOutVerifierId: context.account.id,
      },
    });
    return this.output(ShiftVolunteerOutputDto, res);
  }

  async rateActivity(
    context: RequestContext,
    shiftId: number,
    dto: RateActivityInputDto,
    options?: {
      useVolunteer?: ShiftVolunteerOutputDto;
    },
  ) {
    this.logCaller(context, this.rateActivity);
    const volunteer =
      options?.useVolunteer ??
      (await this.prisma.volunteerShift.findFirst({
        where: {
          accountId: context.account.id,
          shiftId: shiftId,
          active: true,
        },
      }));
    if (volunteer == null) {
      throw new VolunteerNotFoundException();
    }
    const res = await this.prisma.volunteerShift.update({
      where: {
        id: volunteer.id,
      },
      data: {
        shiftRating: dto.rating,
        shiftRatingComment: dto.comment,
      },
    });

    return this.output(ShiftVolunteerOutputDto, res);
  }

  mapToDto(raw: any, shift?: Shift): ShiftVolunteerOutputDto {
    const canCheckIn =
      shift != null && raw.status == ShiftVolunteerStatus.Approved
        ? this.checkCanCheckIn(shift, raw, false)
        : undefined;
    const canCheckOut =
      shift != null && raw.status == ShiftVolunteerStatus.Approved
        ? this.checkCanCheckOut(shift, raw, false)
        : undefined;
    return this.output(ShiftVolunteerOutputDto, {
      ...raw,
      canCheckIn,
      canCheckOut,
    });
  }
}
