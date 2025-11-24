import { GeofenceDTO } from '@/geofences/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDefined, IsNotEmpty } from 'class-validator';
export class ContentMetaDTO {
  @Expose()
  @IsNotEmpty()
  @ApiProperty({ format: 'uuid' })
  id: string;

  @Expose()
  @IsDefined()
  @Type(() => GeofenceDTO)
  @ApiProperty()
  fence: GeofenceDTO;

  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  type: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  descriptor: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  repoUrl: string;
}
