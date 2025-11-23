import { GeofenceDTO } from '@/geofences/dtos';
import { UserDTO } from '@/users/dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { EventType } from '../common/event-type';
import { Point } from 'geojson';

export class EventDTO {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  type: EventType;

  @Expose()
  @ApiProperty()
  user: UserDTO;

  @Expose()
  @ApiProperty()
  fence: GeofenceDTO;

  @Expose()
  @ApiProperty()
  location: Point;

  @Expose()
  @ApiProperty()
  timestamp: Date;
}
