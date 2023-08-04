import { Injectable } from '@nestjs/common';

import { OrganizationMemberStatus } from '@app/organization/constants';
import { Prisma } from '@prisma/client';
import { AppLogger } from '../../common/logger';
import { RequestContext } from '../../common/request-context';
import { AbstractService } from '../../common/services';
import { PrismaService } from '../../prisma';
import {
  ContactOutputDto,
  ContactQueryDto,
  CreateContactInputDto,
  UpdateContactInputDto,
} from '../dtos';

@Injectable()
export class ContactService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
  ) {
    super(logger);
  }

  async getContacts(context: RequestContext, query: ContactQueryDto) {
    this.logCaller(context, this.getById);
    const contacts = await this.prisma.contact.findMany({
      where: this.getContactWhereInput(context, query),
      take: query.limit,
      skip: query.offset,
    });
    return this.output(ContactOutputDto, contacts);
  }

  getContactWhereInput(context: RequestContext, query: ContactQueryDto) {
    const where: Prisma.ContactWhereInput = {};

    if (query.id) {
      where.id = {
        in: query.id,
      };
    }

    if (query.accountId) {
      where.accountId = query.accountId;
    }

    if (query.organizationId) {
      where.account = {
        members: {
          some: {
            organizationId: query.organizationId,
            status: OrganizationMemberStatus.Approved,
          },
        },
      };
    }

    return where;
  }

  async getById(context: RequestContext, id: number) {
    this.logCaller(context, this.getById);
    const contact = await this.prisma.contact.findUnique({
      where: {
        id: id,
      },
    });
    return this.output(ContactOutputDto, contact);
  }

  async create(
    context: RequestContext,
    dto: CreateContactInputDto,
  ): Promise<ContactOutputDto> {
    this.logCaller(context, this.create);
    const contact = await this.prisma.contact.create({
      data: { ...dto, accountId: context.account.id },
    });
    return this.output(ContactOutputDto, contact);
  }

  async createMany(
    context: RequestContext,
    dtos: CreateContactInputDto[],
  ): Promise<ContactOutputDto[]> {
    this.logCaller(context, this.createMany);
    const contacts = await this.prisma.$transaction(
      dtos.map((dto) =>
        this.prisma.contact.create({
          data: { ...dto, accountId: context.account.id },
        }),
      ),
    );
    return this.outputArray(ContactOutputDto, contacts);
  }

  async createManyTransaction(
    context: RequestContext,
    dtos: CreateContactInputDto[],
    transaction: Omit<
      PrismaService,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    >,
  ): Promise<ContactOutputDto[]> {
    this.logCaller(context, this.createMany);

    const contacts: any[] = [];
    for (const dto of dtos) {
      const contact = await transaction.contact.create({
        data: { ...dto, accountId: context.account.id },
      });
      contacts.push(contact);
    }

    return this.outputArray(ContactOutputDto, contacts);
  }

  async update(
    context: RequestContext,
    id: number,
    dto: UpdateContactInputDto,
  ): Promise<ContactOutputDto> {
    this.logCaller(context, this.update);
    const contact = await this.prisma.contact.update({
      where: { id: id },
      data: dto,
    });
    return this.output(ContactOutputDto, contact);
  }

  async delete(context: RequestContext, id: number): Promise<ContactOutputDto> {
    this.logCaller(context, this.delete);
    const contact = await this.prisma.contact.delete({
      where: {
        id: id,
      },
    });
    return this.output(ContactOutputDto, contact);
  }
}
