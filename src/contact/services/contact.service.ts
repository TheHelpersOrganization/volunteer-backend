import { Injectable } from '@nestjs/common';

import { AppLogger } from '../../common/logger';
import { RequestContext } from '../../common/request-context';
import { AbstractService } from '../../common/services';
import { PrismaService } from '../../prisma';
import { ContactInputDto, ContactOutputDto } from '../dtos';

@Injectable()
export class ContactService extends AbstractService {
  constructor(logger: AppLogger, private readonly prisma: PrismaService) {
    super(logger);
  }

  async createMany(
    context: RequestContext,
    dtos: ContactInputDto[],
  ): Promise<ContactOutputDto[]> {
    this.logCaller(context, this.createMany);
    const contacts = await this.prisma.$transaction(
      dtos.map((dto) => this.prisma.contact.create({ data: dto })),
    );
    return this.outputArray(ContactOutputDto, contacts);
  }
}
