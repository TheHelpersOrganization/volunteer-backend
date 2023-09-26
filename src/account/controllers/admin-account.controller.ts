import { Role } from '@app/auth/constants';
import { RequireRoles } from '@app/auth/decorators';
import { JwtAuthGuard, RolesGuard } from '@app/auth/guards';
import { BaseApiErrorResponse, SwaggerBaseApiResponse } from '@app/common/dtos';
import { ReqContext, RequestContext } from '@app/common/request-context';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  AccountOutputDto,
  AdminAccountBanInputDto,
  AdminAccountVerifyInputDto,
  BaseAccountQueryDto,
  GetAccountQueryDto,
} from '../dtos';
import { AdminAccountService } from '../services';

@Controller('admin/accounts')
export class AdminAccountController {
  constructor(private readonly adminAccountService: AdminAccountService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({
    summary: 'Get users as a list API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([AccountOutputDto]),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(Role.Admin, Role.Volunteer)
  async getAccounts(
    @ReqContext() ctx: RequestContext,
    @Query() query: GetAccountQueryDto,
  ): Promise<AccountOutputDto[]> {
    return this.adminAccountService.getAccounts(ctx, query);
  }

  @Put(':id/verify')
  async verifyAccount(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Body() dto: AdminAccountVerifyInputDto,
    @Query() query: BaseAccountQueryDto,
  ) {
    return this.adminAccountService.verifyAccount(context, id, dto, query);
  }

  @Put(':id/ban')
  async banAccount(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Body() dto: AdminAccountBanInputDto,
    @Query() query: BaseAccountQueryDto,
  ) {
    return this.adminAccountService.banAccount(context, id, dto, query);
  }

  @RequireRoles(Role.SuperAdmin)
  @Post(':id/grant-admin')
  async grantAdmin(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ) {
    return this.adminAccountService.grantAdminRole(context, id);
  }
}
