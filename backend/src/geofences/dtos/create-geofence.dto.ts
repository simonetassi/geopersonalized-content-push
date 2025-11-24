import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { Geometry } from 'geojson';

export class CreateGeofenceDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsObject()
  @IsDefined()
  @ApiProperty()
  geometry: Geometry;

  @IsObject()
  @IsDefined()
  @ApiProperty()
  metadata: Record<string, any>;
}
