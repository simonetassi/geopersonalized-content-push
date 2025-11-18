import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Geometry } from 'geojson';

export class GeofenceDTO {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  geometry: Geometry;

  @Expose()
  @ApiProperty()
  metadata: Record<string, any>;
}
