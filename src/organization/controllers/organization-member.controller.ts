import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { GrantRoleInputDto, RevokeRoleInputDto } from '../dtos';
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
  ): Promise<MemberOutputDto[]> {
    return this.organizationMemberService.getMe(context, organizationId);
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

  @Post(':memberId/role/grant')
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

  @Post(':memberId/role/revoke')
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
