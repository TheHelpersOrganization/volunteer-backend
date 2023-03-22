import { Injectable } from '@nestjs/common';
import { Organization, Prisma } from '@prisma/client';
import { AppLogger } from 'src/common/logger';
import { AbstractService } from 'src/common/services';

import { RequestContext } from '../../common/request-context';
import { ContactService } from '../../contact/services';
import { LocationService } from '../../location/services';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateOrganizationInputDto,
  GetOrganizationQueryDto,
  GetOrganizationQueryInclude,
  OrganizationOutputDto,
} from '../dtos';
import { UpdateOrganizationInputDto } from '../dtos/update-organization.input.dto';

@Injectable()
export class OrganizationService extends AbstractService {
  constructor(
    readonly logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly locationService: LocationService,
    private readonly contactService: ContactService,
  ) {
    super(logger);
  }

  async getAll(
    context: RequestContext,
    query: GetOrganizationQueryDto,
  ): Promise<OrganizationOutputDto[]> {
    this.logCaller(context, this.getAll);

    const organizations = await this.prisma.organization.findMany({
      take: query.limit,
      skip: query.offset,
      ...(query.includes && {
        include: {
          ...(query.includes.includes(GetOrganizationQueryInclude.Contacts) && {
            organizationContacts: {
              include: {
                contact: true,
              },
            },
          }),
          ...(query.includes.includes(
            GetOrganizationQueryInclude.Locations,
          ) && {
            organizationLocations: {
              include: {
                location: true,
              },
            },
          }),
        },
      }),
    });

    const res = organizations.map((o) => ({
      ...o,
      organizationContacts: undefined,
      organizationLocations: undefined,
      contacts: o.organizationContacts?.map((c) => c.contact),
      locations: o.organizationLocations?.map((l) => l.location),
    }));

    console.log(res);

    return this.outputArray(OrganizationOutputDto, res);
  }

  async getById(
    context: RequestContext,
    id: number,
    query: GetOrganizationQueryDto,
  ): Promise<OrganizationOutputDto> {
    this.logCaller(context, this.getAll);
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: id,
        ...(query.includes && {
          include: {
            ...(query.includes.includes(
              GetOrganizationQueryInclude.Contacts,
            ) && {
              organizationContacts: {
                include: {
                  contact: true,
                },
              },
            }),
            ...(query.includes.includes(
              GetOrganizationQueryInclude.Locations,
            ) && {
              organizationLocations: {
                include: {
                  location: true,
                },
              },
            }),
          },
        }),
      },
    });
    return this.output(OrganizationOutputDto, organization);
  }

  async create(
    context: RequestContext,
    dto: CreateOrganizationInputDto,
    query: GetOrganizationQueryDto,
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
        const organization = await this.prisma.organization.create({
          data: {
            ...raw,
            ownerId: context.account.id,
            organizationLocations: {
              createMany: {
                data: dto.locations.map((l) => ({ locationId: l })),
              },
            },
            organizationFiles: {
              createMany: {
                data: fileIds,
              },
            },
            organizationContacts: {
              createMany: {
                data: dto.locations.map((c) => ({ contactId: c })),
              },
            },
          },
          ...(query.includes && {
            include: {
              ...(query.includes.includes(
                GetOrganizationQueryInclude.Contacts,
              ) && {
                organizationContacts: {
                  include: {
                    contact: true,
                  },
                },
              }),
              ...(query.includes.includes(
                GetOrganizationQueryInclude.Locations,
              ) && {
                organizationLocations: {
                  include: {
                    location: true,
                  },
                },
              }),
            },
          }),
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
      contacts: org.organizationContacts?.map((c) => c.contact),
      locations: org.organizationLocations?.map((l) => l.location),
    };
    return this.output(OrganizationOutputDto, res);
  }

  async update(
    context: RequestContext,
    id: number,
    dto: UpdateOrganizationInputDto,
    query: GetOrganizationQueryDto,
  ): Promise<OrganizationOutputDto> {
    this.logCaller(context, this.update);
    const raw = {
      ...dto,
      banner: undefined,
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
              upsert: dto.locations.map((l) => ({
                where: { locationId: l },
                update: {},
                create: { locationId: l },
              })),
            },
            organizationFiles: {
              upsert: dto.files.map((l) => ({
                where: { fileId: l },
                update: {},
                create: { fileId: l },
              })),
            },
            organizationContacts: {
              upsert: dto.contacts.map((l) => ({
                where: { contactId: l },
                update: {},
                create: { contactId: l },
              })),
            },
          },
          ...(query.includes && {
            include: {
              ...(query.includes.includes(
                GetOrganizationQueryInclude.Contacts,
              ) && {
                organizationContacts: {
                  include: {
                    contact: true,
                  },
                },
              }),
              ...(query.includes.includes(
                GetOrganizationQueryInclude.Locations,
              ) && {
                organizationLocations: {
                  include: {
                    location: true,
                  },
                },
              }),
            },
          }),
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
      contacts: org.organizationContacts?.map((c) => c.contact),
      locations: org.organizationLocations?.map((l) => l.location),
    };
    return this.output(OrganizationOutputDto, res);
  }
}
