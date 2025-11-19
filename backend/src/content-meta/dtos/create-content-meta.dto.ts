import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateContentMetaDTO {
  @IsUUID()
  @ApiProperty()
  fenceId: string;

  @IsString()
  @ApiProperty()
  type: string;

  @IsString()
  @ApiProperty()
  descriptor: string;

  @IsString()
  @ApiProperty()
  repoUrl: string;
}
