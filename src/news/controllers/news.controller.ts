import { ReqContext, RequestContext } from '@app/common/request-context';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  CreateNewsInputDto,
  ManyNewsQueryDto,
  NewsQueryDto,
  UpdateNewsInputDto,
} from '../dtos';
import { NewsAuthorizationService, NewsService } from '../services';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly newsAuthorizationService: NewsAuthorizationService,
  ) {}

  @Get()
  async getNews(
    @ReqContext() context: RequestContext,
    @Query() query: ManyNewsQueryDto,
  ) {
    return this.newsService.getNews(
      context,
      query,
      this.newsAuthorizationService.getAuthorizeWhereQuery(context),
    );
  }

  @Get(':id')
  async getNewsById(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: NewsQueryDto,
  ) {
    return this.newsService.getNewsById(
      context,
      id,
      query,
      this.newsAuthorizationService.getAuthorizeWhereQuery(context),
    );
  }

  @Post()
  async createNews(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateNewsInputDto,
  ) {
    await this.newsAuthorizationService.validateCanCreateNews(
      context,
      dto.organizationId,
    );
    return this.newsService.createNews(context, dto);
  }

  @Put(':id')
  async updateNews(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNewsInputDto,
  ) {
    await this.newsAuthorizationService.validateCanUpdateNews(context, id);
    return this.newsService.updateNews(context, id, dto);
  }

  @Delete(':id')
  async deleteNews(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.newsAuthorizationService.validateCanDeleteNews(context, id);
    return this.newsService.deleteNews(context, id);
  }
}
