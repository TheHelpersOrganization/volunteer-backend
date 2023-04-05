import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Role } from 'src/auth/constants';
import { RequireRoles } from 'src/auth/decorators';
import { ReqContext, RequestContext } from 'src/common/request-context';
import {
  CreateOrganizationInputDto,
  OrganizationOutputDto,
  OrganizationQueryDto,
  UpdateOrganizationInputDto,
} from '../dtos';
import { OrganizationService } from '../services';

@RequireRoles(Role.Moderator)
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

  @Get('me')
  async getVerifiedById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Query() query: OrganizationQueryDto,
  ) {
    return this.organizationService.getOwnedOrganizations(context, query);
  }

  @Get(':id')
  async getOrganizationById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ) {
    return this.organizationService.getOwnedOrganizationById(context, id);
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
