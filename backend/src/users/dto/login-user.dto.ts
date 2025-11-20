import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LoginUserDTO {
  @Expose()
  @ApiProperty()
  username: string;

  @Expose()
  @ApiProperty()
  password: string;
}
