import { activityMinimalSelect } from '@app/activity/constants';
import { AppLogger } from '@app/common/logger';
import { RequestContext } from '@app/common/request-context';
import { AbstractService } from '@app/common/services';
import { organizationMinimalSelect } from '@app/organization/constants';
import { PrismaService } from '@app/prisma';
import { getProfileBasicSelect } from '@app/profile/dtos';
import { ProfileService } from '@app/profile/services';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NewsType } from '../constants';
import {
  CreateNewsInputDto,
  ManyNewsQueryDto,
  NewsInclude,
  NewsOutputDto,
  NewsQueryDto,
  NewsSort,
  UpdateNewsInputDto,
} from '../dtos';
import { CreateAuthorizedNewsWhereQuery } from '../types';

@Injectable()
export class NewsService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prismaService: PrismaService,
    private readonly profileService: ProfileService,
  ) {
    super(logger);
  }

  async getNews(
    context: RequestContext,
    query: ManyNewsQueryDto,
    createAuthorizedNewsWhereQuery: CreateAuthorizedNewsWhereQuery,
  ) {
    const news = await this.prismaService.news.findMany({
      where: this.getWhere(query, createAuthorizedNewsWhereQuery),
      include: this.getInclude(query.include),
      take: query.limit,
      skip: query.offset,
      orderBy: this.getOrderBy(query),
    });

    const res = news.map((raw) => this.mapToDto(raw));

    if (
      query.sort == NewsSort.PopularityAsc ||
      query.sort == NewsSort.PopularityDesc
    ) {
      res.sort((a, b) => {
        if (query.sort == NewsSort.PopularityAsc) {
          return a.views - b.views;
        } else {
          return b.views - a.views;
        }
      });
    }

    return res;
  }

  async getNewsById(
    context: RequestContext,
    id: number,
    query: NewsQueryDto,
    createAuthorizedNewsWhereQuery: CreateAuthorizedNewsWhereQuery,
  ) {
    const where: Prisma.NewsWhereUniqueInput = {
      ...createAuthorizedNewsWhereQuery({}),
      id: id,
    };
    const res = await this.prismaService.news.findUnique({
      where: where,
      include: this.getInclude(query.include),
    });
    return this.mapToDto(res);
  }

  getWhere(
    query: ManyNewsQueryDto,
    createAuthorizedWhereQuery?: CreateAuthorizedNewsWhereQuery,
  ) {
    // Everyone can see published news and news from organizations they are members of
    const where: Prisma.NewsWhereInput = createAuthorizedWhereQuery
      ? createAuthorizedWhereQuery({})
      : {};

    if (query.id) {
      where.id = {
        in: query.id,
      };
    }

    if (query.type) {
      where.type = {
        in: query.type,
      };
    }

    if (query.organizationId) {
      where.organizationId = query.organizationId;
    }

    if (query.authorId) {
      where.authorId = query.authorId;
    }

    if (query.isPublished != null) {
      where.isPublished = query.isPublished;
    }

    if (query.search) {
      where.title = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    return where;
  }

  getInclude(includes?: NewsInclude[]) {
    const include: Prisma.NewsInclude = {};

    if (includes?.includes(NewsInclude.Author)) {
      include.author = {
        include: {
          profile: {
            select: this.profileService.parseProfileSelect(
              getProfileBasicSelect,
            ),
          },
        },
      };
    }
    if (includes?.includes(NewsInclude.Organization)) {
      include.organization = {
        select: organizationMinimalSelect,
      };
    }
    if (includes?.includes(NewsInclude.Reference)) {
      include.Activity = {
        select: activityMinimalSelect,
      };
    }

    if (Object.keys(include).length == 0) {
      return undefined;
    }

    return include;
  }

  getOrderBy(query: ManyNewsQueryDto) {
    const orderBy:
      | Prisma.NewsOrderByWithRelationAndSearchRelevanceInput
      | Prisma.NewsOrderByWithRelationAndSearchRelevanceInput[] = {};

    if (query.sort == NewsSort.PopularityDesc) {
      orderBy.popularity = 'desc';
    } else if (query.sort == NewsSort.PopularityAsc) {
      orderBy.popularity = 'asc';
    } else if (
      (query.sort == NewsSort.RelevanceAsc ||
        query.sort == NewsSort.RelevanceDesc) &&
      query.search
    ) {
      orderBy._relevance = {
        fields: ['title'],
        search: query.search,
        sort: query.sort == NewsSort.RelevanceAsc ? 'asc' : 'desc',
      };
    } else if (query.sort == NewsSort.DateAsc) {
      orderBy.createdAt = 'asc';
    } else if (query.sort == NewsSort.DateDesc) {
      orderBy.createdAt = 'desc';
    } else if (query.sort == NewsSort.ViewsAsc) {
      orderBy.views = 'asc';
    } else if (query.sort == NewsSort.ViewsDesc) {
      orderBy.views = 'desc';
    }

    return orderBy;
  }

  async createNews(context: RequestContext, dto: CreateNewsInputDto) {
    const res = await this.prismaService.news.create({
      data: {
        type: dto.type,
        title: dto.title,
        content: dto.content,
        contentFormat: dto.contentFormat,
        thumbnail: dto.thumbnail,
        organizationId: dto.organizationId,
        authorId: context.account.id,
        isPublished: dto.isPublished,
        activityId: dto.activityId,
      },
    });
    return this.mapToDto(res);
  }

  async updateNews(
    context: RequestContext,
    id: number,
    dto: UpdateNewsInputDto,
  ) {
    const res = await this.prismaService.news.update({
      where: { id: id },
      data: {
        type: dto.type,
        title: dto.title,
        content: dto.content,
        contentFormat: dto.contentFormat,
        thumbnail: dto.thumbnail,
        isPublished: dto.isPublished,
        activityId: dto.type == NewsType.Activity ? dto.activityId : null,
      },
    });
    return this.mapToDto(res);
  }

  async deleteNews(context: RequestContext, id: number) {
    const res = await this.prismaService.news.delete({
      where: { id: id },
    });
    return this.mapToDto(res);
  }

  mapToDto(raw: any) {
    return this.output(NewsOutputDto, {
      ...raw,
      author: raw.author?.profile,
      activity: raw.Activity,
    });
  }
}
