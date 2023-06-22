import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';

import {
  CreateSkillInputDto,
  SkillOutputDto,
  SkillQueryDto,
  UpdateSkillInputDto,
} from '../dtos';
import { SkillService } from '../services';

@Controller('skills')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Post()
  async create(
    @ReqContext() context: RequestContext,
    @Body() createSkillDto: CreateSkillInputDto,
  ): Promise<SkillOutputDto> {
    return this.skillService.create(context, createSkillDto);
  }

  @Get()
  async getAll(
    @ReqContext() context: RequestContext,
    @Query() query: SkillQueryDto,
  ) {
    return this.skillService.getAll(context, query);
  }

  @Get(':id')
  async getById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ) {
    return this.skillService.getById(context, +id);
  }

  @Put(':id')
  async update(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Body() updateSkillDto: UpdateSkillInputDto,
  ) {
    return this.skillService.update(context, id, updateSkillDto);
  }

  @Delete(':id')
  async delete(@ReqContext() context: RequestContext, @Param('id') id: number) {
    return this.skillService.delete(context, id);
  }
}
