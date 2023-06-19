import { Injectable } from '@nestjs/common';

import { AppLogger } from '../../common/logger';
import { RequestContext } from '../../common/request-context';
import { AbstractService } from '../../common/services';
import { PrismaService } from '../../prisma';
import {
  ContactOutputDto,
  CreateContactInputDto,
  UpdateContactInputDto,
} from '../dtos';

@Injectable()
export class ContactService extends AbstractService {
  constructor(logger: AppLogger, private readonly prisma: PrismaService) {
    super(logger);
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
    const contact = await this.prisma.contact.create({ data: dto });
    return this.output(ContactOutputDto, contact);
  }

  async createMany(
    context: RequestContext,
    dtos: CreateContactInputDto[],
  ): Promise<ContactOutputDto[]> {
    this.logCaller(context, this.createMany);
    const contacts = await this.prisma.$transaction(async (tx) =>
      dtos.map((dto) => tx.contact.create({ data: dto })),
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
    const contacts = await dtos.map((dto) =>
      transaction.contact.create({ data: dto }),
    );

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
