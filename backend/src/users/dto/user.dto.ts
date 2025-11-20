import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserDTO {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  surname: string;

  @Expose()
  @ApiProperty()
  username: string;

  @Expose()
  @ApiProperty()
  password: string;

  @Expose()
  @ApiProperty()
  role: 'user' | 'admin';
}
