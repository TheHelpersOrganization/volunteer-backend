import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { AbstractService } from 'src/common/services';

import { PaginationParamsDto } from '../../common/dtos';
import { RequestContext } from '../../common/request-context';
import { ContactService } from '../../contact/services';
import { LocationService } from '../../location/services';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizationInputDto, OrganizationOutputDto } from '../dtos';
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
    query: PaginationParamsDto,
  ): Promise<OrganizationOutputDto[]> {
    this.logCaller(context, this.getAll);
    const organizations = await this.prisma.organization.findMany({
      take: query.limit,
      skip: query.offset,
    });
    return this.outputArray(OrganizationOutputDto, organizations);
  }

  async getById(
    context: RequestContext,
    id: number,
  ): Promise<OrganizationOutputDto> {
    this.logCaller(context, this.getAll);
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: id,
      },
    });
    return this.output(OrganizationOutputDto, organization);
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
    return this.prisma.$transaction(
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
        });
        return this.output(OrganizationOutputDto, organization);
      },
      {
        timeout: 15000,
      },
    );
  }

  async update(
    context: RequestContext,
    id: number,
    dto: UpdateOrganizationInputDto,
  ): Promise<OrganizationOutputDto> {
    this.logCaller(context, this.update);
    const raw = {
      ...dto,
      banner: undefined,
      locations: undefined,
      files: undefined,
      contacts: undefined,
    };
    return this.prisma.$transaction(
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
        });
        return this.output(OrganizationOutputDto, organization);
      },
      {
        timeout: 15000,
      },
    );
  }
}
