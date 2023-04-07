import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { OrganizationMemberStatus } from '../constants';
import { MemberOutputDto, RejectMemberInputDto } from '../dtos';
import { OrganizationMemberService } from '../services';

@Controller('mod/organizations/:organizationId/members')
export class ModOrganizationMemberController {
  constructor(
    private readonly organizationMemberService: OrganizationMemberService,
  ) {}

  @Get()
  async getMembers(
    @ReqContext() context: RequestContext,
    @Param('organizationId') organizationId: number,
  ): Promise<MemberOutputDto[]> {
    return this.organizationMemberService.getMembers(context, organizationId);
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
