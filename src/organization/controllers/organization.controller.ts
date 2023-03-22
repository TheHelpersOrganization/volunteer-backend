import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';

import { ReqContext, RequestContext } from '../../common/request-context';
import { GetOrganizationQueryDto } from '../dtos';
import { CreateOrganizationInputDto } from '../dtos/create-organization.input.dto';
import { UpdateOrganizationInputDto } from '../dtos/update-organization.input.dto';
import { OrganizationService } from '../services';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  getAll(
    @ReqContext() context: RequestContext,
    @Query() query: GetOrganizationQueryDto,
  ) {
    return this.organizationService.getAll(context, query);
  }

  @Get(':id')
  getById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Query() query: GetOrganizationQueryDto,
  ) {
    return this.organizationService.getById(context, id, query);
  }

  @Put(':id')
  async updateById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Body() dto: UpdateOrganizationInputDto,
    @Query() query: GetOrganizationQueryDto,
  ) {
    return this.organizationService.update(context, id, dto, query);
  }

  @Post()
  async create(
    @ReqContext() context: RequestContext,
    @Body() createOrganizationDto: CreateOrganizationInputDto,
    @Query() query: GetOrganizationQueryDto,
  ) {
    return this.organizationService.create(
      context,
      createOrganizationDto,
      query,
    );
  }
}
