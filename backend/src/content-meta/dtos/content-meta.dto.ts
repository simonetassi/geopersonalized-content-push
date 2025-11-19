import { GeofenceDTO } from '@/geofences/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
export class ContentMetaDTO {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @Type(() => GeofenceDTO)
  @ApiProperty()
  fence: GeofenceDTO;

  @Expose()
  @ApiProperty()
  type: string;

  @Expose()
  @ApiProperty()
  descriptor: string;

  @Expose()
  @ApiProperty()
  repoUrl: string;
}
