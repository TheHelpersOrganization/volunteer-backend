import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { OrganizationMemberStatus } from '../constants';
import { RejectMemberInputDto } from '../dtos';
import { MemberOutputDto } from '../dtos/member.output.dto';
import { OrganizationMemberService } from '../services';

@Controller('organizations/:organizationId/members')
export class OrganizationMemberController {
  constructor(
    private readonly organizationMemberService: OrganizationMemberService,
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

  // -- Mod --

  @Get()
  async getMembers(
    @ReqContext() context: RequestContext,
    @Param('organizationId') organizationId: number,
  ): Promise<MemberOutputDto[]> {
    return this.organizationMemberService.getMany(context, organizationId);
  }

  @Post(':id/approve')
  async approveMember(
    @ReqContext() context: RequestContext,
    @Param('organizationId') organizationId: number,
    @Param('id') id: number,
  ): Promise<MemberOutputDto> {
    return this.organizationMemberService.approveOrRejectMember(
      context,
      organizationId,
      id,
      OrganizationMemberStatus.Approved,
    );
  }

  @Post(':id/reject')
  async rejectMember(
    @ReqContext() context: RequestContext,
    @Param('organizationId') organizationId: number,
    @Param('id') id: number,
    @Body() dto: RejectMemberInputDto,
  ): Promise<MemberOutputDto> {
    return this.organizationMemberService.approveOrRejectMember(
      context,
      organizationId,
      id,
      OrganizationMemberStatus.Rejected,
      dto.rejectionReason,
    );
  }

  @Post(':id/remove')
  async updateStatus(
    @ReqContext() context: RequestContext,
    @Param('organizationId') organizationId: number,
    @Param('id') id: number,
  ): Promise<MemberOutputDto> {
    return this.organizationMemberService.removeMember(
      context,
      organizationId,
      id,
    );
  }
}
