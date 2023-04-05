import { Controller, Get, Param, Query } from '@nestjs/common';

import { ReqContext, RequestContext } from '../../common/request-context';
import { OrganizationOutputDto, OrganizationQueryDto } from '../dtos';
import { OrganizationService } from '../services';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  getVerified(
    @ReqContext() context: RequestContext,
    @Query() query: OrganizationQueryDto,
  ): Promise<OrganizationOutputDto[]> {
    return this.organizationService.getVerifiedOrganizations(context, query);
  }

  @Get(':id')
  async getVerifiedById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ) {
    return this.organizationService.getVerifiedById(context, id);
  }
}
