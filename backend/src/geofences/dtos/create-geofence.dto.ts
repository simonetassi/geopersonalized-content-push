import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';
import { Geometry } from 'geojson';

export class CreateGeofenceDTO {
  @IsString()
  @ApiProperty()
  name: string;

  @IsObject()
  @ApiProperty()
  geometry: Geometry;

  @IsObject()
  @ApiProperty()
  metadata: Record<string, any>;
}
