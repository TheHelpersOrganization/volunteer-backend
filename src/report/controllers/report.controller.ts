import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { GetReportQueryDto } from '../dtos';
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

  @Get(':id')
  async getReportById(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.reportService.getReportById(context, id);
  }
}
