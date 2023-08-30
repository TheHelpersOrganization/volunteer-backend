import { Role } from '@app/auth/constants';
import { RequireRoles } from '@app/auth/decorators';
import { ReqContext, RequestContext } from '@app/common/request-context';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  CountReportQueryDto,
  CreateReportInputDto,
  CreateReportMessageInputDto,
  GetReportQueryDto,
} from '../dtos';
import { ReportService } from '../services';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  async getReports(
    @ReqContext() context: RequestContext,
    @Query() query: GetReportQueryDto,
  ) {
    return this.reportService.getReports(context, query);
  }

  @Get('count')
  async countReports(
    @ReqContext() context: RequestContext,
    @Query() query: CountReportQueryDto,
  ) {
    return this.reportService.countReports(context, query);
  }

  @Get(':id')
  async getReportById(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetReportQueryDto,
  ) {
    return this.reportService.getReportById(context, id, query);
  }

  @Post()
  async createReport(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateReportInputDto,
  ) {
    return this.reportService.createReport(context, dto);
  }

  @Post(':id/messages')
  async createReportMessage(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReportMessageInputDto,
  ) {
    return this.reportService.createReportMessage(context, id, dto);
  }

  @Put(':id/cancel')
  async cancelReport(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.reportService.cancelReport(context, id);
  }

  @RequireRoles(Role.Admin)
  @Put(':id/complete')
  async completeReport(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.reportService.completeReport(context, id);
  }

  @RequireRoles(Role.Admin)
  @Put(':id/reject')
  async rejectReport(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.reportService.rejectReport(context, id);
  }
}
