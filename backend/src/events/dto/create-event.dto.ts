import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsISO8601, IsUUID } from 'class-validator';
import { EventType } from '../common/event-type';
import { Point } from 'geojson';

export class CreateEventDTO {
  @Expose()
  @IsEnum(EventType)
  @ApiProperty({ enum: EventType })
  type: EventType;

  @Expose()
  @IsUUID()
  @ApiProperty()
  userId: string;

  @Expose()
  @IsUUID()
  @ApiProperty()
  fenceId: string;

  @Expose()
  @ApiProperty()
  location: Point;

  @Expose()
  @IsISO8601()
  @ApiProperty()
  timestamp: Date;
}
