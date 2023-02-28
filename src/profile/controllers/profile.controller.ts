import { Body, Controller, Get, HttpStatus, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AbstractController } from 'src/common/controllers';
import { SwaggerBaseApiResponse } from 'src/common/dtos';
import { AppLogger } from 'src/common/logger';
import { ReqContext, RequestContext } from 'src/common/request-context';

import { ProfileOutputDto, UpdateProfileInputDto } from '../dtos';
import { ProfileService } from '../services';

@ApiTags('profiles')
@Controller('profiles')
export class ProfileController extends AbstractController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly logger: AppLogger,
  ) {
    super();
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
  async getProfile(
    @ReqContext() ctx: RequestContext,
  ): Promise<ProfileOutputDto> {
    return this.profileService.getProfile(ctx);
  }

  @Put('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update account profile',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(ProfileOutputDto),
  })
  async updateProfile(
    @ReqContext() ctx: RequestContext,
    @Body() input: UpdateProfileInputDto,
  ): Promise<ProfileOutputDto> {
    return this.profileService.updateProfile(ctx, input);
  }
}
