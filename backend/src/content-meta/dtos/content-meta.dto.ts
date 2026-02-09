import { GeofenceDTO } from '@/geofences/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDefined, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export enum ContentType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  HTML = 'HTML',
  JSON = 'JSON',
  PDF = 'PDF',
  AUDIO = 'AUDIO',
}

export class ContentMetaDTO {
  @Expose()
  @IsNotEmpty()
  @ApiProperty({ format: 'uuid' })
  id: string;

  @Expose()
  @IsUUID()
  @ApiProperty({ format: 'uuid' })
  fenceId: string;

  @Expose()
  @IsDefined()
  @Type(() => GeofenceDTO)
  @ApiProperty({ type: () => GeofenceDTO, required: false })
  fence?: GeofenceDTO;

  @Expose()
  @IsNotEmpty()
  @IsEnum(ContentType)
  @ApiProperty({ enum: ContentType, example: ContentType.IMAGE })
  type: ContentType;

  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  descriptor: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  repoUrl: string;
}
