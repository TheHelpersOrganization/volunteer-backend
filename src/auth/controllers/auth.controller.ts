import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccountOutputDto } from 'src/account/dtos';
import { OtpService } from 'src/otp/services';

import {
  BaseApiErrorResponse,
  SwaggerBaseApiResponse,
} from '../../common/dtos/base-api-response.dto';
import { AppLogger } from '../../common/logger/logger.service';
import { ReqContext } from '../../common/request-context/req-context.decorator';
import { RequestContext } from '../../common/request-context/request-context.dto';
import { Public } from '../decorators';
import { VerifyAccountDto, VerifyAccountTokenInputDto } from '../dtos';
import { LoginInput } from '../dtos/auth-login-input.dto';
import { RefreshTokenInput } from '../dtos/auth-refresh-token-input.dto';
import { RegisterInput } from '../dtos/auth-register-input.dto';
import { RegisterOutput } from '../dtos/auth-register-output.dto';
import { AuthTokenOutput } from '../dtos/auth-token-output.dto';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AuthController.name);
  }

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'User login API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AuthTokenOutput),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async login(
    @ReqContext() ctx: RequestContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() credential: LoginInput,
  ): Promise<AuthTokenOutput> {
    this.logger.log(ctx, `${this.login.name} was called`);

    const authToken = this.authService.login(ctx);
    return authToken;
  }

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'User registration API',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(RegisterOutput),
  })
  async register(
    @ReqContext() ctx: RequestContext,
    @Body() input: RegisterInput,
  ): Promise<RegisterOutput> {
    const registeredAccount = await this.authService.register(ctx, input);
    return registeredAccount;
  }

  @Public()
  @Post('refresh-token')
  @ApiOperation({
    summary: 'Refresh access token API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AuthTokenOutput),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async refreshToken(
    @ReqContext() ctx: RequestContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() credential: RefreshTokenInput,
  ): Promise<AuthTokenOutput> {
    this.logger.log(ctx, `${this.refreshToken.name} was called`);

    const authToken = await this.authService.refreshToken(ctx);
    return authToken;
  }

  @Public()
  @Post('verify-account')
  @UseInterceptors(ClassSerializerInterceptor)
  async verifyAccount(
    @ReqContext() ctx: RequestContext,
    @Body() dto: VerifyAccountDto,
  ): Promise<AccountOutputDto> {
    return this.authService.verifyAccount(ctx, dto);
  }

  @Public()
  @Post('verify-account-token')
  @UseInterceptors(ClassSerializerInterceptor)
  async createVerifyAccountToken(
    @ReqContext() ctx: RequestContext,
    @Body() dto: VerifyAccountTokenInputDto,
  ): Promise<{ successful: boolean }> {
    return this.authService.createVerifyAccountToken(ctx, dto);
  }
}
