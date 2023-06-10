import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import {
  CreateAccountVerificationInputDto,
  GetAccountVerificationQueryDto,
  GetAccountVerificationsQueryDto,
} from '../dtos';
import { AccountVerificationService } from '../services';

@Controller('account-verifications')
export class AccountVerificationController {
  constructor(
    private readonly accountVerificationService: AccountVerificationService,
  ) {}

  @Get()
  async getVerificationRequest(
    @ReqContext() context: RequestContext,
    @Query() query: GetAccountVerificationsQueryDto,
  ) {
    return this.accountVerificationService.getVerificationRequests(
      context,
      query,
    );
  }

  @Get(':id')
  async getVerificationRequestById(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetAccountVerificationQueryDto,
  ) {
    return this.accountVerificationService.getVerificationRequestById(
      context,
      id,
      query,
    );
  }

  @Post()
  async createVerificationRequest(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateAccountVerificationInputDto,
    @Query() query: GetAccountVerificationsQueryDto,
  ) {
    return this.accountVerificationService.createVerificationRequest(
      context,
      dto,
      query,
    );
  }
}
