import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { ReqContext, RequestContext } from '../../common/request-context';
import {
  ContactQueryDto,
  CreateContactInputDto,
  UpdateContactInputDto,
} from '../dtos';
import { ContactService } from '../services';

@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  async getContacts(
    @ReqContext() context: RequestContext,
    @Query() query: ContactQueryDto,
  ) {
    return this.contactService.getContacts(context, query);
  }

  @Get(':id')
  async getContactById(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
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
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContactInputDto,
  ) {
    return this.contactService.update(context, id, dto);
  }

  @Delete(':id')
  async delete(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.contactService.delete(context, id);
  }
}
