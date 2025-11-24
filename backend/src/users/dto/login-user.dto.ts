import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class LoginUserDTO {
  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  username: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
