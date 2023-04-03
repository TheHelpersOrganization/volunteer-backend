import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';

import { ReqContext, RequestContext } from '../../common/request-context';
import {
  DisableOrganizationInputDto,
  OrganizationOutputDto,
  OrganizationQueryDto,
  VerifyOrganizationInputDto,
} from '../dtos';
import { CreateOrganizationInputDto } from '../dtos/create-organization.input.dto';
import { UpdateOrganizationInputDto } from '../dtos/update-organization.input.dto';
import { OrganizationService } from '../services';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  getAll(
    @ReqContext() context: RequestContext,
    @Query() query: OrganizationQueryDto,
  ): Promise<OrganizationOutputDto[]> {
    return this.organizationService.getAll(context, query);
  }

  @Get(':id')
  getById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ): Promise<OrganizationOutputDto | null> {
    return this.organizationService.getById(context, id);
  }

  @Put(':id')
  async updateById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Body() dto: UpdateOrganizationInputDto,
  ): Promise<OrganizationOutputDto> {
    return this.organizationService.update(context, id, dto);
  }

  @Post()
  async create(
    @ReqContext() context: RequestContext,
    @Body() createOrganizationDto: CreateOrganizationInputDto,
  ): Promise<OrganizationOutputDto> {
    return this.organizationService.create(context, createOrganizationDto);
  }

  // -- Admin --

  @Put(':id/verify')
  async verify(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Body() dto: VerifyOrganizationInputDto,
  ): Promise<OrganizationOutputDto> {
    return this.organizationService.updateStatus(context, id, dto);
  }

  @Put(':id/disable')
  async disable(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Body() dto: DisableOrganizationInputDto,
  ): Promise<OrganizationOutputDto> {
    return this.organizationService.updateDisable(context, id, dto);
  }
}
