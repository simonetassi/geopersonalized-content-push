import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AnalyticsMetricDTO } from './dtos';
import { FeatureCollection } from 'geojson';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('heatmap')
  @ApiOperation({ operationId: 'heatmap' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      required: ['type', 'features'],
      properties: {
        type: {
          type: 'string',
          enum: ['FeatureCollection'],
        },
        features: {
          type: 'array',
          items: {
            type: 'object',
            required: ['type', 'geometry', 'properties'],
            properties: {
              type: {
                type: 'string',
                enum: ['Feature'],
              },
              geometry: {
                type: 'object',
                required: ['type', 'coordinates'],
                properties: {
                  type: {
                    type: 'string',
                    enum: ['Point'],
                  },
                  coordinates: {
                    type: 'array',
                    description: '[Longitude, Latitude]',
                    items: { type: 'number' },
                    minItems: 2,
                    maxItems: 3,
                  },
                },
              },
              properties: {
                type: 'object',
                properties: {
                  weight: {
                    type: 'number',
                    description: 'Heatmap intensity',
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  public getHeatmap(): Promise<FeatureCollection> {
    return this.service.getHeatmapData();
  }

  @Get('metrics')
  @ApiOperation({ operationId: 'metrics' })
  @ApiOkResponse({ type: [AnalyticsMetricDTO] })
  public getMetrics(): Promise<AnalyticsMetricDTO[]> {
    return this.service.getMetricsOverview();
  }

  @Get('clustering')
  @ApiOperation({ operationId: 'clustering' })
  @ApiOkResponse({ type: [AnalyticsMetricDTO] })
  public async getClustering(): Promise<AnalyticsMetricDTO[]> {
    const result = await this.service.runClusteringAnalysis();

    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    return result.data;
  }
}
