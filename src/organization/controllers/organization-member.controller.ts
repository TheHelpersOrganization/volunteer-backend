import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import {
  GetMemberByIdQueryDto,
  GetMemberQueryDto,
  GrantRoleInputDto,
  MemberRolesOutputDto,
  RevokeRoleInputDto,
} from '../dtos';
import { MemberOutputDto } from '../dtos/member.output.dto';
import {
  OrganizationMemberService,
  OrganizationRoleService,
} from '../services';

@Controller('organizations/:organizationId/members')
export class OrganizationMemberController {
  constructor(
    private readonly organizationMemberService: OrganizationMemberService,
    private readonly organizationRoleService: OrganizationRoleService,
  ) {}

  @Get('me')
  async getMe(
    @ReqContext() context: RequestContext,
    @Param('organizationId') organizationId: number,
    @Query() query?: GetMemberByIdQueryDto,
  ): Promise<MemberOutputDto[]> {
    return this.organizationMemberService.getMe(context, organizationId, query);
  }

  @Get(':memberId')
  async getMemberById(
    @ReqContext() context: RequestContext,
    @Param('organizationId') organizationId: number,
    @Param('memberId') memberId: number,
    @Query() dto: GetMemberQueryDto,
  ) {
    return this.organizationMemberService.getMemberById(
      context,
      organizationId,
      memberId,
      dto,
    );
  }

  @Post('join')
  async join(
    @ReqContext() context: RequestContext,
    @Param('organizationId') organizationId: number,
  ): Promise<MemberOutputDto> {
    return this.organizationMemberService.join(context, organizationId);
  }

  @Post('cancel')
  async cancelJoin(
    @ReqContext() context: RequestContext,
    @Param('organizationId') organizationId: number,
  ): Promise<MemberOutputDto> {
    return this.organizationMemberService.cancel(context, organizationId);
  }

  @Post('leave')
  async leave(
    @ReqContext() context: RequestContext,
    @Param('organizationId') organizationId: number,
  ): Promise<MemberOutputDto> {
    return this.organizationMemberService.leave(context, organizationId);
  }

  @Get(':memberId/roles')
  async getMemberRoles(
    @ReqContext() context: RequestContext,
    @Param('organizationId') organizationId: number,
    @Param('memberId') memberId: number,
  ): Promise<MemberRolesOutputDto> {
    return this.organizationMemberService.getMemberRoles(
      context,
      organizationId,
      memberId,
    );
  }

  @Post(':memberId/roles/grant')
  async grantRole(
    @ReqContext() context: RequestContext,
    @Param('organizationId') organizationId: number,
    @Param('memberId') memberId: number,
    @Body() dto: GrantRoleInputDto,
  ): Promise<MemberOutputDto> {
    await this.organizationRoleService.validateAccountMemberGrantRole(
      organizationId,
      context.account.id,
      memberId,
      dto.role,
    );
    return this.organizationMemberService.grantMemberRole(
      context,
      organizationId,
      memberId,
      dto,
    );
  }

  @Post(':memberId/roles/revoke')
  async revokeRole(
    @ReqContext() context: RequestContext,
    @Param('organizationId') organizationId: number,
    @Param('memberId') memberId: number,
    @Body() dto: RevokeRoleInputDto,
  ): Promise<MemberOutputDto> {
    await this.organizationRoleService.validateAccountMemberGrantRole(
      organizationId,
      context.account.id,
      memberId,
      dto.role,
    );
    return this.organizationMemberService.revokeMemberRole(
      context,
      organizationId,
      memberId,
      dto,
    );
  }
}
