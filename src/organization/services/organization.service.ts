import { AppLogger } from '@app/common/logger';
import { AbstractService } from '@app/common/services';
import { Injectable } from '@nestjs/common';

import { countGroupByTime } from '@app/common/utils';
import { RoleService } from '@app/role/services';
import { ShiftVolunteerStatus } from '@app/shift-volunteer/constants';
import { ShiftVolunteerReviewedEvent } from '@app/shift-volunteer/events';
import { ShiftStatus } from '@app/shift/constants';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { RequestContext } from '../../common/request-context';
import { ContactService } from '../../contact/services';
import { LocationService } from '../../location/services';
import { PrismaService } from '../../prisma/prisma.service';
import {
  OrganizationMemberRole,
  OrganizationMemberStatus,
  OrganizationStatus,
} from '../constants';
import {
  CountOrganizationQueryDto,
  CreateOrganizationInputDto,
  DisableOrganizationInputDto,
  OrganizationInclude,
  OrganizationOutputDto,
  OrganizationQueryDto,
  RejectOrganizationInputDto,
} from '../dtos';
import { UpdateOrganizationInputDto } from '../dtos/update-organization.input.dto';
import {
  InvalidOrganizationStatusException,
  OrganizationIsNotVerifiedException,
  OrganizationNotFoundException,
} from '../exceptions';

@Injectable()
export class OrganizationService extends AbstractService {
  constructor(
    override readonly logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly locationService: LocationService,
    private readonly contactService: ContactService,
    private readonly roleService: RoleService,
  ) {
    super(logger);
  }

  async getOrganizations(
    context: RequestContext,
    query: OrganizationQueryDto,
  ): Promise<OrganizationOutputDto[]> {
    this.logCaller(context, this.getOrganizations);
    const accountId = context.account.id;

    const organizations = await this.prisma.organization.findMany({
      where: this.getOrganizationWhere(context, query),
      take: query.limit,
      skip: query.offset,
      include: {
        organizationContacts: {
          include: {
            contact: true,
          },
        },
        organizationLocations: {
          include: {
            location: true,
          },
        },
        organizationFiles:
          query.include?.includes(OrganizationInclude.File) == null
            ? undefined
            : {
                include: {
                  file: true,
                },
              },
        members: {
          where: {
            OR: [
              {
                status: OrganizationMemberStatus.Approved,
              },
              {
                accountId: accountId,
              },
            ],
          },
        },
      },
    });
    const res = organizations.map((o) =>
      this.mapRawToDto(context, o, accountId),
    );

    return this.outputArray(OrganizationOutputDto, res);
  }

  getOrganizationWhere(context: RequestContext, query: OrganizationQueryDto) {
    const where: Prisma.OrganizationWhereInput = {};
    if (query.id != null || query.excludeId != null) {
      where.id = {
        in: query.id,
        notIn: query.excludeId,
      };
    }
    if (query.name != null) {
      where.name = {
        contains: query.name.trim(),
        mode: 'insensitive',
      };
    }
    if (query.status != null) {
      where.status = query.status;
    }
    if (query.owner != null) {
      where.ownerId = query.owner
        ? context.account.id
        : {
            not: context.account.id,
          };
    }
    if (query.isDisabled != null) {
      where.isDisabled = query.isDisabled;
    }
    where.members = this.getMemberQuery(query, context.account.id);
    return where;
  }

  async getOrganizationById(
    context: RequestContext,
    id: number,
    query?: OrganizationQueryDto,
  ): Promise<OrganizationOutputDto | null> {
    this.logCaller(context, this.getOrganizations);
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: id,
        name: {
          contains: query?.name?.trim(),
          mode: 'insensitive',
        },
        members:
          query != null
            ? this.getMemberQuery(query, context.account.id)
            : undefined,
        status: query?.status,
        ownerId: query?.owner ? context.account.id : undefined,
      },
      include: {
        organizationContacts: {
          include: {
            contact: true,
          },
        },
        organizationLocations: {
          include: {
            location: true,
          },
        },
        organizationFiles:
          query?.include?.includes(OrganizationInclude.File) == null
            ? undefined
            : {
                include: {
                  file: true,
                },
              },
        members: {
          where: {
            status: OrganizationMemberStatus.Approved,
          },
        },
      },
    });
    if (organization == null) {
      return null;
    }
    return this.mapRawToDto(context, organization, context.account.id);
  }

  private getMemberQuery(query: OrganizationQueryDto, accountId: number) {
    if (query.joined == null && query.memberStatus == null) {
      return undefined;
    }
    const whereMember: Prisma.MemberListRelationFilter | undefined = {};
    if (query.joined != null) {
      if (query.joined === true) {
        whereMember.some = {
          accountId: accountId,
          status: {
            in: [
              OrganizationMemberStatus.Pending,
              OrganizationMemberStatus.Approved,
            ],
          },
        };
      } else {
        whereMember.none = {
          accountId: accountId,
          status: {
            in: [
              OrganizationMemberStatus.Pending,
              OrganizationMemberStatus.Approved,
            ],
          },
        };
      }
    }
    if (query.memberStatus != null) {
      whereMember.some = {
        accountId: accountId,
        status: query.memberStatus,
      };
    }
    return whereMember;
  }

  private getOrganizationInclude(query: OrganizationQueryDto) {
    const include: Prisma.OrganizationInclude = {
      organizationContacts: {
        include: {
          contact: true,
        },
      },
      organizationLocations: {
        include: {
          location: true,
        },
      },
    };
    if (query.include?.includes(OrganizationInclude.File)) {
      include.organizationFiles = {
        include: {
          file: true,
        },
      };
    }
    return include;
  }

  async getVerifiedOrganizations(
    context: RequestContext,
    query: OrganizationQueryDto,
  ) {
    this.logCaller(context, this.getVerifiedOrganizations);
    query.status = OrganizationStatus.Verified;
    return this.getOrganizations(context, query);
  }

  async getVerifiedOrganizationById(
    context: RequestContext,
    id: number,
  ): Promise<OrganizationOutputDto | null> {
    this.logCaller(context, this.getVerifiedOrganizationById);
    return this.getOrganizationById(context, id, {
      status: OrganizationStatus.Verified,
      limit: 1,
      offset: 0,
    });
  }

  async getMyOrganizations(
    context: RequestContext,
    query: OrganizationQueryDto,
  ) {
    this.logCaller(context, this.getMyOrganizations);
    query.memberStatus = OrganizationMemberStatus.Approved;
    return this.getOrganizations(context, query);
  }

  async countMyOrganizations(
    context: RequestContext,
    query: OrganizationQueryDto,
  ) {
    this.logCaller(context, this.countMyOrganizations);
    query.memberStatus = OrganizationMemberStatus.Approved;
    return this.getOrganizations(context, query);
  }

  async getMyOrganizationById(
    context: RequestContext,
    id: number,
  ): Promise<OrganizationOutputDto | null> {
    this.logCaller(context, this.getMyOrganizationById);
    return this.getOrganizationById(context, id, {
      memberStatus: OrganizationMemberStatus.Approved,
      limit: 1,
      offset: 0,
    });
  }

  async countOrganizations(
    context: RequestContext,
    query: CountOrganizationQueryDto,
  ) {
    this.logCaller(context, this.countOrganizations);
    const conditions: Prisma.Sql[] = [];
    if (query.isDisabled != null) {
      conditions.push(Prisma.sql`"isDisabled" = ${query.isDisabled}`);
    }
    if (query.status != null) {
      conditions.push(Prisma.sql`"status" = ${query.status}`);
    }
    if (query.startTime != null) {
      conditions.push(Prisma.sql`"createdAt" >= ${query.startTime}`);
    }
    if (query.endTime != null) {
      conditions.push(Prisma.sql`"createdAt" <= ${query.endTime}`);
    }
    const sqlWhere =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty;
    const res: {
      month: Date;
      count: bigint;
    }[] = await this.prisma.$queryRaw`
      SELECT
      DATE_TRUNC('month', "createdAt")
        AS month,
      COUNT(*) AS count
      FROM "Organization"
      ${sqlWhere}
      GROUP BY DATE_TRUNC('month',"createdAt");
    `;

    return countGroupByTime(res);
  }

  async create(
    context: RequestContext,
    dto: CreateOrganizationInputDto,
  ): Promise<OrganizationOutputDto> {
    this.logCaller(context, this.create);
    const ownerRole = await this.roleService.getRoleByNameOrThrow(
      OrganizationMemberRole.Owner,
    );
    const raw = {
      ...dto,
      locations: undefined,
      files: undefined,
      contacts: undefined,
    };
    const org = await this.prisma.$transaction(
      async () => {
        const fileIds = dto.files.map((f) => ({ fileId: f }));
        const locationIds = (
          await this.locationService.createMany(context, dto.locations)
        ).map((l) => ({
          locationId: l.id,
        }));
        const contactIds = (
          await this.contactService.createMany(context, dto.contacts)
        ).map((d) => ({
          contactId: d.id,
        }));
        const organization = await this.prisma.organization.create({
          data: {
            ...raw,
            ownerId: context.account.id,
            organizationLocations: {
              createMany: {
                data: locationIds,
              },
            },
            organizationFiles: {
              createMany: {
                data: fileIds,
              },
            },
            organizationContacts: {
              createMany: {
                data: contactIds,
              },
            },
            // Must be created after the organization is created
            members: {
              create: {
                accountId: context.account.id,
                status: OrganizationMemberStatus.Approved,
                MemberRole: {
                  create: {
                    role: {
                      connect: {
                        id: ownerRole.id,
                      },
                    },
                  },
                },
              },
            },
          },
          include: {
            organizationContacts: {
              include: {
                contact: true,
              },
            },
            organizationLocations: {
              include: {
                location: true,
              },
            },
          },
        });
        return organization;
      },
      {
        timeout: 15000,
      },
    );
    return this.mapRawToDto(context, org);
  }

  async update(
    context: RequestContext,
    id: number,
    dto: UpdateOrganizationInputDto,
  ): Promise<OrganizationOutputDto> {
    this.logCaller(context, this.update);
    const raw = {
      ...dto,
      locations: undefined,
      files: undefined,
      contacts: undefined,
    };
    const org = await this.prisma.$transaction(
      async () => {
        const organization = await this.prisma.organization.update({
          // Only update if the organization belongs to the user
          where: { id: id, ownerId: context.account.id },
          data: {
            ...raw,
            organizationLocations: {
              deleteMany: {},
              create: dto.locations.map((d) => ({
                location: {
                  create: d,
                },
              })),
            },
            organizationFiles: {
              deleteMany: {},
              create: dto.files.map((d) => ({
                fileId: d,
              })),
            },
            organizationContacts: {
              deleteMany: {},
              createMany: {
                data: dto.contacts.map((d) => ({
                  contactId: d,
                })),
              },
            },
          },
          include: {
            organizationContacts: {
              include: {
                contact: true,
              },
            },
            organizationLocations: {
              include: {
                location: true,
              },
            },
          },
        });
        return organization;
      },
      {
        timeout: 15000,
      },
    );
    return this.mapRawToDto(context, org);
  }

  async updateStatus(
    context: RequestContext,
    id: number,
    status: OrganizationStatus,
    dto?: RejectOrganizationInputDto,
  ): Promise<OrganizationOutputDto> {
    this.logCaller(context, this.updateStatus);
    let verifierId: number | undefined = undefined;

    const org = await this.prisma.organization.findUnique({
      where: { id: id },
    });
    if (org == null) {
      throw new OrganizationNotFoundException();
    }

    if (status === OrganizationStatus.Cancelled) {
      if (org.status !== OrganizationStatus.Pending) {
        throw new InvalidOrganizationStatusException();
      }
    }
    if (
      status === OrganizationStatus.Verified ||
      status === OrganizationStatus.Rejected
    ) {
      if (org.status !== OrganizationStatus.Pending) {
        throw new InvalidOrganizationStatusException();
      }
      verifierId = context.account.id;
    }

    const updated = await this.prisma.organization.update({
      where: { id: id },
      data: {
        status: status,
        verifierId: verifierId,
        verifierComment: OrganizationStatus.Rejected
          ? dto?.verifierComment
          : undefined,
      },
    });
    return this.output(OrganizationOutputDto, updated);
  }

  async updateDisable(
    context: RequestContext,
    id: number,
    dto: DisableOrganizationInputDto,
  ): Promise<OrganizationOutputDto> {
    this.logCaller(context, this.updateDisable);
    const org = await this.prisma.organization.update({
      where: { id: id },
      data: {
        isDisabled: dto.isDisabled,
        disabledBy: dto.isDisabled ? context.account.id : null,
      },
    });
    return this.output(OrganizationOutputDto, org);
  }

  async validateApprovedOrganization(organizationId: number) {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });
    if (organization == null) {
      throw new OrganizationNotFoundException();
    }
    if (organization.status !== OrganizationStatus.Verified) {
      throw new OrganizationIsNotVerifiedException();
    }
    return this.output(OrganizationOutputDto, organization);
  }

  async onShiftVolunteerReviewed(event: ShiftVolunteerReviewedEvent) {
    const context = event.context;
    this.logCaller(context, this.onShiftVolunteerReviewed);
    // TODO: When shift time is updated, we may need to update profile skill
    const duration = dayjs(event.shift.endTime).diff(
      dayjs(event.shift.startTime),
      'hour',
      true,
    );
    const shiftVolunteer = event.next;
    const previousShiftVolunteer = event.previous;
    const previousHours = duration * (previousShiftVolunteer.completion ?? 0);
    const nextHours = duration * (shiftVolunteer.completion ?? 0);
    const organizationId = (
      await this.prisma.activity.findUnique({
        where: {
          id: event.shift.activityId,
        },
        select: {
          organizationId: true,
        },
      })
    )?.organizationId;
    await this.prisma.organization.update({
      where: {
        id: organizationId,
      },
      data: {
        hoursContributed: {
          increment: nextHours - previousHours,
        },
      },
    });
  }

  async refreshOrganizationHoursContributed(context: RequestContext) {
    this.logCaller(context, this.refreshOrganizationHoursContributed);
    const findMany = {
      include: {
        organizationActivities: {
          include: {
            shifts: {
              where: {
                status: ShiftStatus.Completed,
              },
              include: {
                shiftVolunteers: {
                  where: {
                    status: ShiftVolunteerStatus.Approved,
                    completion: {
                      gt: 0,
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    let organizations = await this.prisma.organization.findMany(findMany);
    while (organizations.length > 0) {
      const updates: {
        id: number;
        hoursContributed: number;
      }[] = [];
      console.log(organizations.length);
      for (const organization of organizations) {
        const shifts = organization.organizationActivities.flatMap(
          (activity) => activity.shifts,
        );
        const hoursContributed = shifts.reduce(
          (acc, shift) =>
            acc +
            shift.shiftVolunteers.reduce(
              (acc, shiftVolunteer) =>
                acc +
                dayjs(shift.endTime).diff(
                  dayjs(shift.startTime),
                  'hour',
                  true,
                ) *
                  (shiftVolunteer.completion ?? 0),
              0,
            ),
          0,
        );
        updates.push({
          id: organization.id,
          hoursContributed: hoursContributed,
        });
      }
      await this.prisma.$transaction(
        updates.map((update) =>
          this.prisma.organization.update({
            where: {
              id: update.id,
            },
            data: {
              hoursContributed: update.hoursContributed,
            },
          }),
        ),
      );
      organizations = await this.prisma.organization.findMany({
        ...findMany,
        skip: 1,
        cursor: { id: organizations[organizations.length - 1].id },
      });
    }
  }

  private mapRawToDto(
    context: RequestContext,
    raw: any,
    accountId?: number,
  ): OrganizationOutputDto {
    const res = {
      ...raw,
      organizationContacts: undefined,
      organizationLocations: undefined,
      contacts: raw.organizationContacts?.map((c) => c.contact) ?? [],
      locations: raw.organizationLocations?.map((l) => l.location) ?? [],
      files:
        raw.ownerId !== context.account.id || !context.isAdmin
          ? undefined
          : raw.organizationFiles?.map((f) => f.file),
      numberOfMembers: raw.members?.filter(
        (m) => m.status === OrganizationMemberStatus.Approved,
      ).length,
      myMembers:
        accountId == null
          ? undefined
          : raw.members?.filter((m) => m.accountId === accountId),
      hasJoined:
        accountId == null
          ? undefined
          : raw.members?.find(
              (m) =>
                m.accountId === accountId &&
                m.status === OrganizationMemberStatus.Approved,
            ) != null,
    };
    return this.output(OrganizationOutputDto, res);
  }
}
