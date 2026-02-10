import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { ContentType } from './content-meta.dto';

export class UpdateContentMetaDTO {
  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({ format: 'uuid' })
  fenceId?: string;

  @IsEnum(ContentType)
  @IsOptional()
  @ApiPropertyOptional({ enum: ContentType })
  type?: ContentType;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  descriptor?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  repoUrl?: string;
}
