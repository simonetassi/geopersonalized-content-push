import { Controller, Post, Get, Param, Res, Delete } from '@nestjs/common';
import { PrivacyAnalysisService } from './privacy-analysis.service';
import { Response } from 'express';
import { ApiOperation } from '@nestjs/swagger';

@Controller('privacy-analysis')
export class PrivacyAnalysisController {
  public constructor(private readonly service: PrivacyAnalysisService) {}

  @Post('simulate/:fenceId')
  @ApiOperation({ operationId: 'simulate' })
  public async simulate(@Param('fenceId') fenceId: string): Promise<{
    success: boolean;
    count: number;
    message: string;
  }> {
    return this.service.runSimulation(fenceId);
  }

  @Get('export')
  @ApiOperation({ operationId: 'export' })
  public async export(@Res() res: Response) {
    const csv = await this.service.exportCsv();

    res.header('Content-Type', 'text/csv');
    res.attachment('privacy_experiment_data.csv');
    return res.send(csv);
  }

  @Delete()
  @ApiOperation({ operationId: 'wipe' })
  public wipe(): Promise<void> {
    return this.service.wipe();
  }
}
