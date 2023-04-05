import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';

import { ReqContext, RequestContext } from '../../common/request-context';
import { OrganizationStatus } from '../constants';
import {
  DisableOrganizationInputDto,
  OrganizationOutputDto,
  OrganizationQueryDto,
  RejectOrganizationInputDto,
} from '../dtos';
import { CreateOrganizationInputDto } from '../dtos/create-organization.input.dto';
import { UpdateOrganizationInputDto } from '../dtos/update-organization.input.dto';
import { OrganizationService } from '../services';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  getVerified(
    @ReqContext() context: RequestContext,
    @Query() query: OrganizationQueryDto,
  ): Promise<OrganizationOutputDto[]> {
    return this.organizationService.getVerifiedOrganizations(context, query);
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
  @Get('all')
  getAll(
    @ReqContext() context: RequestContext,
    @Query() query: OrganizationQueryDto,
  ): Promise<OrganizationOutputDto[]> {
    return this.organizationService.getAll(context, query);
  }

  @Post(':id/verify')
  async verify(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ): Promise<OrganizationOutputDto> {
    return this.organizationService.updateStatus(
      context,
      id,
      OrganizationStatus.Verified,
    );
  }

  @Post(':id/cancel-verify')
  async cancelVerify(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ): Promise<OrganizationOutputDto> {
    return this.organizationService.updateStatus(
      context,
      id,
      OrganizationStatus.Cancelled,
    );
  }

  @Post(':id/reject')
  async reject(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Body() dto: RejectOrganizationInputDto,
  ): Promise<OrganizationOutputDto> {
    return this.organizationService.updateStatus(
      context,
      id,
      OrganizationStatus.Rejected,
      dto,
    );
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
