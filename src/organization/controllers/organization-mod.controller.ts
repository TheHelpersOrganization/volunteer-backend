import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import {
  CreateOrganizationInputDto,
  OrganizationOutputDto,
  OrganizationQueryDto,
  UpdateOrganizationInputDto,
} from '../dtos';
import { OrganizationService } from '../services';

@Controller('mod/organizations')
export class OrganizationModController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  getVerified(
    @ReqContext() context: RequestContext,
    @Query() query: OrganizationQueryDto,
  ): Promise<OrganizationOutputDto[]> {
    return this.organizationService.getVerifiedOrganizations(context, query);
  }

  @Get(':id')
  async getVerifiedById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ) {
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
}
