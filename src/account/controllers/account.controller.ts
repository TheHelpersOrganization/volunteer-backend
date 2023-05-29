import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  BaseApiErrorResponse,
  SwaggerBaseApiResponse,
} from '../../common/dtos/base-api-response.dto';
import { AppLogger } from '../../common/logger/logger.service';
import { ReqContext } from '../../common/request-context/req-context.decorator';
import { RequestContext } from '../../common/request-context/request-context.dto';
import { UpdateAccountRolesInputDto } from '../dtos';
import { AccountOutputDto } from '../dtos/account-output.dto';
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
    type: SwaggerBaseApiResponse(AccountOutputDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async getMyAccount(
    @ReqContext() ctx: RequestContext,
  ): Promise<AccountOutputDto> {
    this.logger.log(ctx, `${this.getMyAccount.name} was called`);

    const account = await this.accountService.findById(ctx, ctx.account.id);
    return account;
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
    type: SwaggerBaseApiResponse(AccountOutputDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async getAccount(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<AccountOutputDto> {
    this.logger.log(ctx, `${this.getAccount.name} was called`);

    const account = await this.accountService.findById(ctx, id);
    return account;
  }

  // TODO: ADD RoleGuard
  // NOTE : This can be made a admin only endpoint. For normal users they can use PATCH /me
  @Patch(':id')
  @ApiOperation({
    summary: 'Update user API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AccountOutputDto),
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
  ): Promise<AccountOutputDto> {
    this.logger.log(ctx, `${this.updateAccount.name} was called`);

    const account = await this.accountService.updateAccount(ctx, userId, input);
    return account;
  }

  @Post(':id/roles')
  async updateAccountRoles(
    @ReqContext() ctx: RequestContext,
    @Param('id') userId: number,
    @Body() dto: UpdateAccountRolesInputDto,
  ): Promise<AccountOutputDto> {
    return this.accountService.updateAccountRoles(ctx, userId, dto);
  }
}
