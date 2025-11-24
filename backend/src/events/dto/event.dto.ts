import { GeofenceDTO } from '@/geofences/dtos';
import { UserDTO } from '@/users/dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { EventType } from '../common/event-type';
import { Point } from 'geojson';
import { IsDefined, IsNotEmpty } from 'class-validator';

export class EventDTO {
  @Expose()
  @IsNotEmpty()
  @ApiProperty({ format: 'uuid' })
  id: string;

  @Expose()
  @IsDefined()
  @ApiProperty()
  type: EventType;

  @Expose()
  @IsDefined()
  @ApiProperty()
  user: UserDTO;

  @Expose()
  @IsDefined()
  @ApiProperty()
  fence: GeofenceDTO;

  @Expose()
  @IsDefined()
  @ApiProperty()
  location: Point;

  @Expose()
  @IsDefined()
  @ApiProperty()
  timestamp: Date;
}
