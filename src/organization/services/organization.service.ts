import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { AbstractService } from 'src/common/services';

import { RequestContext } from '../../common/request-context';
import { ContactService } from '../../contact/services';
import { LocationService } from '../../location/services';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationStatus } from '../constants';
import {
  CreateOrganizationInputDto,
  DisableOrganizationInputDto,
  OrganizationOutputDto,
  OrganizationQueryDto,
  VerifyOrganizationInputDto,
} from '../dtos';
import { UpdateOrganizationInputDto } from '../dtos/update-organization.input.dto';

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

  async getAll(
    context: RequestContext,
    query: OrganizationQueryDto,
  ): Promise<OrganizationOutputDto[]> {
    this.logCaller(context, this.getAll);
    const organizations = await this.prisma.organization.findMany({
      where: {
        name: {
          contains: query.name?.trim(),
          mode: 'insensitive',
        },
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

    const res = organizations.map((o) => ({
      ...o,
      organizationContacts: undefined,
      organizationLocations: undefined,
      contacts: o.organizationContacts?.map((c) => c.contact),
      locations: o.organizationLocations?.map((l) => l.location),
    }));

    return this.outputArray(OrganizationOutputDto, res);
  }

  async getById(
    context: RequestContext,
    id: number,
  ): Promise<OrganizationOutputDto | null> {
    this.logCaller(context, this.getAll);
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: id,
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
    const res = {
      ...organization,
      organizationContacts: undefined,
      organizationLocations: undefined,
      contacts: organization.organizationContacts?.map((c) => c.contact),
      locations: organization.organizationLocations?.map((l) => l.location),
    };

    return this.output(OrganizationOutputDto, res);
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
    const res = {
      ...org,
      organizationContacts: undefined,
      organizationLocations: undefined,
      contacts: org.organizationContacts?.map((c) => c.contact) ?? [],
      locations: org.organizationLocations?.map((l) => l.location) ?? [],
    };
    return this.output(OrganizationOutputDto, res);
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
          where: { id: id },
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
    const res = {
      ...org,
      organizationContacts: undefined,
      organizationLocations: undefined,
      contacts: org.organizationContacts?.map((c) => c.contact) ?? [],
      locations: org.organizationLocations?.map((l) => l.location) ?? [],
    };
    return this.output(OrganizationOutputDto, res);
  }

  async updateStatus(
    context: RequestContext,
    id: number,
    dto: VerifyOrganizationInputDto,
  ): Promise<OrganizationOutputDto> {
    this.logCaller(context, this.updateStatus);
    const verifierId = context.account.id;
    const org = await this.prisma.organization.update({
      where: { id: id },
      data: {
        status: dto.isVerified
          ? OrganizationStatus.Verified
          : OrganizationStatus.Rejected,
        verifierId: verifierId,
      },
    });
    return this.output(OrganizationOutputDto, org);
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
}
