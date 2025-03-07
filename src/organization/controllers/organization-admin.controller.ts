import { Role } from '@app/auth/constants';
import { RequireRoles } from '@app/auth/decorators';
import { ReqContext, RequestContext } from '@app/common/request-context';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { OrganizationStatus } from '../constants';
import {
  OrganizationOutputDto,
  OrganizationQueryDto,
  RejectOrganizationInputDto,
} from '../dtos';
import { OrganizationService } from '../services';

@Controller('admin/organizations')
@RequireRoles(Role.Admin)
export class OrganizationAdminController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  async getAll(
    @ReqContext() context: RequestContext,
    @Query() query: OrganizationQueryDto,
  ): Promise<OrganizationOutputDto[]> {
    return this.organizationService.getOrganizations(context, query);
  }

  @Get(':id')
  async getById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ) {
    return this.organizationService.getOrganizationById(context, id);
  }

  @Post(':id/verify')
  async verify(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ): Promise<OrganizationOutputDto> {
    return this.organizationService.updateStatus(
      context,
      id,
      OrganizationStatus.Verified,
    );
  }

  @Post(':id/cancel-verify')
  async cancelVerify(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ): Promise<OrganizationOutputDto> {
    return this.organizationService.updateStatus(
      context,
      id,
      OrganizationStatus.Cancelled,
    );
  }

  @Post(':id/reject')
  async reject(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Body() dto: RejectOrganizationInputDto,
  ): Promise<OrganizationOutputDto> {
    return this.organizationService.updateStatus(
      context,
      id,
      OrganizationStatus.Rejected,
      dto,
    );
  }

  @Post(':id/enable')
  async enable(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ): Promise<OrganizationOutputDto> {
    return this.organizationService.updateDisable(context, id, {
      isDisabled: false,
    });
  }

  @Post(':id/disable')
  async disable(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ): Promise<OrganizationOutputDto> {
    return this.organizationService.updateDisable(context, id, {
      isDisabled: true,
    });
  }
}
