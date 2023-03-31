import { Body, Controller, Get, HttpStatus, Param, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SwaggerBaseApiResponse } from 'src/common/dtos';
import { AppLogger } from 'src/common/logger';
import { ReqContext, RequestContext } from 'src/common/request-context';

import { ProfileOutputDto, UpdateProfileInputDto } from '../dtos';
import { ProfileService } from '../services';

@ApiTags('profiles')
@Controller('profiles')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(ProfileController.name);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get account profile',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(ProfileOutputDto),
  })
  async getMyProfile(
    @ReqContext() ctx: RequestContext,
  ): Promise<ProfileOutputDto> {
    return this.profileService.getProfile(ctx, ctx.account.id);
  }

  @Get(':id')
  async getProfile(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<ProfileOutputDto> {
    return this.profileService.getProfile(ctx, id);
  }

  @Put('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update account profile',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ProfileOutputDto,
  })
  async updateProfile(
    @ReqContext() ctx: RequestContext,
    @Body() input: UpdateProfileInputDto,
  ): Promise<ProfileOutputDto> {
    return this.profileService.updateProfile(ctx, input);
  }
}
