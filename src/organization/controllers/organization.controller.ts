import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';

import { PaginationParamsDto } from '../../common/dtos';
import { ReqContext, RequestContext } from '../../common/request-context';
import { CreateOrganizationInputDto } from '../dtos/create-organization.input.dto';
import { UpdateOrganizationInputDto } from '../dtos/update-organization.input.dto';
import { OrganizationService } from '../services';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  create(
    @ReqContext() context: RequestContext,
    @Body() createOrganizationDto: CreateOrganizationInputDto,
  ) {
    return this.organizationService.create(context, createOrganizationDto);
  }

  @Put(':id')
  getAll(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Body() dto: UpdateOrganizationInputDto,
  ) {
    console.log('');
  }
}
