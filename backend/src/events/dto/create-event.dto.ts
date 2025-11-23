import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsUUID } from 'class-validator';
import { EventType } from '../common/event-type';
import { Point } from 'geojson';

export class CreateEventDTO {
  @Expose()
  @IsEnum(EventType)
  @ApiProperty({ enum: EventType })
  type: EventType;

  @IsUUID()
  @ApiProperty()
  userId: string;

  @IsUUID()
  @ApiProperty()
  fenceId: string;

  @Expose()
  @ApiProperty()
  location: Point;
}
