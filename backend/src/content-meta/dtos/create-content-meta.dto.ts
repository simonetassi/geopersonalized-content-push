import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ContentType } from './content-meta.dto';

export class CreateContentMetaDTO {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ format: 'uuid' })
  fenceId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  type: ContentType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  descriptor: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  repoUrl: string;
}
