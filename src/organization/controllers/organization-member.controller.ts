import { Controller, Get, Param, Post } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
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
}
