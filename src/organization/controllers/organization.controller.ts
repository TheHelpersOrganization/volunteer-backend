import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';

import { RoleService } from 'src/role/services';
import { ReqContext, RequestContext } from '../../common/request-context';
import { OrganizationMemberRole, organizationMemberRoles } from '../constants';
import {
  OrganizationOutputDto,
  OrganizationQueryDto,
  TransferOwnershipInputDto,
} from '../dtos';
import {
  OrganizationMemberService,
  OrganizationRoleService,
  OrganizationService,
} from '../services';

@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly organizationMemberService: OrganizationMemberService,
    private readonly organizationRoleService: OrganizationRoleService,
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
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.organizationService.getVerifiedOrganizationById(context, id);
  }

  @Post(':id/transfer-ownership')
  async transferOwnership(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TransferOwnershipInputDto,
  ) {
    await this.organizationRoleService.validateAccountMemberHasRole(
      id,
      context.account.id,
      OrganizationMemberRole.Owner,
    );

    return this.organizationMemberService.transferOwnership(context, id, dto);
  }
}
