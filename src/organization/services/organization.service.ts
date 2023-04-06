import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { AbstractService } from 'src/common/services';

import { Prisma } from '@prisma/client';
import { RequestContext } from '../../common/request-context';
import { ContactService } from '../../contact/services';
import { LocationService } from '../../location/services';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationMemberStatus, OrganizationStatus } from '../constants';
import {
  CreateOrganizationInputDto,
  DisableOrganizationInputDto,
  OrganizationOutputDto,
  OrganizationQueryDto,
  RejectOrganizationInputDto,
} from '../dtos';
import { UpdateOrganizationInputDto } from '../dtos/update-organization.input.dto';
import {
  InvalidOrganizationStatusException,
  OrganizationNotFoundException,
} from '../exceptions';

@Injectable()
export class OrganizationService extends AbstractService {
  constructor(
    override readonly logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly locationService: LocationService,
    private readonly contactService: ContactService,
  ) {
    super(logger);
  }

  async get(
    context: RequestContext,
    query: OrganizationQueryDto,
  ): Promise<OrganizationOutputDto[]> {
    this.logCaller(context, this.get);
    const accountId = context.account.id;

    const organizations = await this.prisma.organization.findMany({
      where: {
        name: {
          contains: query.name?.trim(),
          mode: 'insensitive',
        },
        members: this.getMemberQuery(query, accountId),
        status: query.status,
        ownerId: query.owner ? accountId : undefined,
      },
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
      },
    });

    const res = organizations.map((o) => this.mapRawToDto(o));

    return this.outputArray(OrganizationOutputDto, res);
  }

  async getById(
    context: RequestContext,
    id: number,
    query?: OrganizationQueryDto,
  ): Promise<OrganizationOutputDto | null> {
    this.logCaller(context, this.get);
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
      },
    });
    if (organization == null) {
      return null;
    }
    return this.mapRawToDto(organization);
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

  async getVerifiedOrganizations(
    context: RequestContext,
    query: OrganizationQueryDto,
  ) {
    this.logCaller(context, this.getVerifiedOrganizations);
    query.status = OrganizationStatus.Verified;
    return this.get(context, query);
  }

  async getVerifiedOrganizationById(
    context: RequestContext,
    id: number,
  ): Promise<OrganizationOutputDto | null> {
    this.logCaller(context, this.getVerifiedOrganizationById);
    return this.getById(context, id, {
      status: OrganizationStatus.Verified,
      limit: 1,
      offset: 0,
    });
  }

  async getOwnedOrganizations(
    context: RequestContext,
    query: OrganizationQueryDto,
  ) {
    this.logCaller(context, this.getOwnedOrganizations);
    query.owner = true;
    return this.get(context, query);
  }

  async getOwnedOrganizationById(
    context: RequestContext,
    id: number,
  ): Promise<OrganizationOutputDto | null> {
    this.logCaller(context, this.getOwnedOrganizationById);
    return this.getById(context, id, {
      owner: true,
      limit: 1,
      offset: 0,
    });
  }

  async create(
    context: RequestContext,
    dto: CreateOrganizationInputDto,
  ): Promise<OrganizationOutputDto> {
    this.logCaller(context, this.create);
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
    return this.mapRawToDto(org);
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
              create: dto.contacts.map((d) => ({
                contact: {
                  create: d,
                },
              })),
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
    return this.mapRawToDto(org);
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
      },
    });
    return this.output(OrganizationOutputDto, org);
  }

  private mapRawToDto(raw: any): OrganizationOutputDto {
    const res = {
      ...raw,
      organizationContacts: undefined,
      organizationLocations: undefined,
      contacts: raw.organizationContacts?.map((c) => c.contact) ?? [],
      locations: raw.organizationLocations?.map((l) => l.location) ?? [],
    };
    return this.output(OrganizationOutputDto, res);
  }
}
