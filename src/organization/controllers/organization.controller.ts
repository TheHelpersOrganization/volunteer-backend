import { Controller, Get, Param, Query } from '@nestjs/common';

import { RoleService } from 'src/role/services';
import { ReqContext, RequestContext } from '../../common/request-context';
import { organizationMemberRoles } from '../constants';
import { OrganizationOutputDto, OrganizationQueryDto } from '../dtos';
import { OrganizationService } from '../services';

@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly roleService: RoleService,
  ) {}

  @Get()
  get(
    @ReqContext() context: RequestContext,
    @Query() query: OrganizationQueryDto,
  ): Promise<OrganizationOutputDto[]> {
    return this.organizationService.getVerifiedOrganizations(context, query);
  }

  @Get('roles')
  async getOrganizationRoles(context: RequestContext) {
    return this.roleService.getRoleByNamesOrThrow(organizationMemberRoles);
  }

  @Get(':id')
  async getById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ) {
    return this.organizationService.getVerifiedOrganizationById(context, id);
  }
}
