import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class AnalyticsMetricDTO {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  fenceId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsNumber()
  @Min(0)
  @ApiProperty()
  entries: number;

  @IsNumber()
  @Min(0)
  @ApiProperty()
  exits: number;

  @IsNumber()
  @Min(0)
  @ApiProperty()
  views: number;

  @IsNumber()
  @Min(0)
  @ApiProperty()
  avgDwellTimeMinutes: number;

  @IsString()
  @ApiProperty()
  conversionRate: string;

  @IsString()
  @ApiProperty()
  bounceRate: string;

  @IsOptional()
  @IsString()
  @IsIn(['HOTSPOT', 'COLD', 'STANDARD', 'UNKNOWN'])
  @ApiPropertyOptional()
  category?: string;
}
