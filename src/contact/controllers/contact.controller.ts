import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { ReqContext, RequestContext } from '../../common/request-context';
import { CreateContactInputDto, UpdateContactInputDto } from '../dtos';
import { ContactService } from '../services';

@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get(':id')
  async get(@ReqContext() context: RequestContext, @Param('id') id: number) {
    return this.contactService.getById(context, id);
  }

  @Post()
  async create(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateContactInputDto,
  ) {
    return this.contactService.create(context, dto);
  }

  @Put(':id')
  async update(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Body() dto: UpdateContactInputDto,
  ) {
    return this.contactService.update(context, id, dto);
  }

  @Delete(':id')
  async delete(@ReqContext() context: RequestContext, @Param('id') id: number) {
    return this.contactService.delete(context, id);
  }
}
