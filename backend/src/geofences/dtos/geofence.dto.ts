import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDefined, IsNotEmpty } from 'class-validator';
import { Geometry } from 'geojson';

export class GeofenceDTO {
  @Expose()
  @IsNotEmpty()
  @ApiProperty({ format: 'uuid' })
  id: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @Expose()
  @IsDefined()
  @ApiProperty()
  geometry: Geometry;

  @Expose()
  @IsDefined()
  @ApiProperty()
  metadata: Record<string, any>;
}
