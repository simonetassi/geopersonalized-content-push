import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateContentMetaDTO {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ format: 'uuid' })
  fenceId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  type: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  descriptor: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  repoUrl: string;
}
