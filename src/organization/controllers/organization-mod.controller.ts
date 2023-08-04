import { ReqContext, RequestContext } from '@app/common/request-context';
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
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

  @Get('me')
  async getVerifiedById(
    @ReqContext() context: RequestContext,
    @Query() query: OrganizationQueryDto,
  ) {
    return this.organizationService.getMyOrganizations(context, query);
  }

  // @Get('me/count')
  // async count(
  //   @ReqContext() context: RequestContext,
  //   @Query() query: OrganizationQueryDto,
  // ) {
  //   return this.organizationService.getMyOrganizations(context, query);
  // }

  @Get(':id')
  async getOrganizationById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ) {
    return this.organizationService.getMyOrganizationById(context, id);
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
