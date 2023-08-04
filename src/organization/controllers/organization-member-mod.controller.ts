import { ReqContext, RequestContext } from '@app/common/request-context';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { OrganizationMemberStatus } from '../constants';
import {
  GetMemberQueryDto,
  MemberOutputDto,
  RejectMemberInputDto,
} from '../dtos';
import { OrganizationMemberService } from '../services';

@Controller('mod/organizations/:organizationId/members')
export class OrganizationMemberModController {
  constructor(
    private readonly organizationMemberService: OrganizationMemberService,
  ) {}

  @Get()
  async getMembers(
    @ReqContext() context: RequestContext,
    @Param('organizationId') organizationId: number,
    @Query() dto: GetMemberQueryDto,
  ): Promise<MemberOutputDto[]> {
    return this.organizationMemberService.getMembers(
      context,
      organizationId,
      dto,
    );
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
