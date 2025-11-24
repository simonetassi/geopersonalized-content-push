import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { EventType } from '../common/event-type';
import { Point } from 'geojson';

export class CreateEventDTO {
  @Expose()
  @IsDefined()
  @IsEnum(EventType)
  @ApiProperty({ enum: EventType })
  type: EventType;

  @Expose()
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ format: 'uuid' })
  userId: string;

  @Expose()
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ format: 'uuid' })
  fenceId: string;

  @Expose()
  @IsDefined()
  @ApiProperty()
  location: Point;

  @Expose()
  @IsISO8601()
  @IsDefined()
  @ApiProperty()
  timestamp: Date;
}
