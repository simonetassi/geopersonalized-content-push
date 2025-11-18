import { IsObject, IsString } from 'class-validator';
import { Geometry } from 'geojson';

export class CreateGeofenceDTO {
  @IsString()
  name: string;

  @IsObject()
  geometry: Geometry;

  @IsObject()
  metadata: Record<string, any>;
}
