import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ROLE } from '../../auth/constants/role.constant';
import { Roles } from '../../auth/decorators/role.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from '../../common/dtos/base-api-response.dto';
import { PaginationParamsDto } from '../../common/dtos/pagination-params.dto';
import { AppLogger } from '../../common/logger/logger.service';
import { ReqContext } from '../../common/request-context/req-context.decorator';
import { RequestContext } from '../../common/request-context/request-context.dto';
import { AccountOutput } from '../dtos/account-output.dto';
import { UpdateAccountInput } from '../dtos/account-update-input.dto';
import { AccountService } from '../services/account.service';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AccountController.name);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('me')
  @ApiOperation({
    summary: 'Get user me API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AccountOutput),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async getMyAccount(
    @ReqContext() ctx: RequestContext,
  ): Promise<BaseApiResponse<AccountOutput>> {
    this.logger.log(ctx, `${this.getMyAccount.name} was called`);

    const account = await this.accountService.findById(ctx, ctx.account.id);
    return { data: account, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({
    summary: 'Get users as a list API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([AccountOutput]),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.USER)
  async getAccounts(
    @ReqContext() ctx: RequestContext,
    @Query() query: PaginationParamsDto,
  ): Promise<BaseApiResponse<AccountOutput[]>> {
    this.logger.log(ctx, `${this.getAccounts.name} was called`);

    const { users: accounts, count } = await this.accountService.getAccounts(
      ctx,
      query.limit,
      query.offset,
    );

    return { data: accounts, meta: { count } };
  }

  // TODO: ADD RoleGuard
  // NOTE : This can be made a admin only endpoint. For normal users they can use GET /me
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by id API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AccountOutput),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async getAccount(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<BaseApiResponse<AccountOutput>> {
    this.logger.log(ctx, `${this.getAccount.name} was called`);

    const account = await this.accountService.findById(ctx, id);
    return { data: account, meta: {} };
  }

  // TODO: ADD RoleGuard
  // NOTE : This can be made a admin only endpoint. For normal users they can use PATCH /me
  @Patch(':id')
  @ApiOperation({
    summary: 'Update user API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AccountOutput),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async updateAccount(
    @ReqContext() ctx: RequestContext,
    @Param('id') userId: number,
    @Body() input: UpdateAccountInput,
  ): Promise<BaseApiResponse<AccountOutput>> {
    this.logger.log(ctx, `${this.updateAccount.name} was called`);

    const account = await this.accountService.updateAccount(ctx, userId, input);
    return { data: account, meta: {} };
  }
}
