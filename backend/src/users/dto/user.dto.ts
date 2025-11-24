import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserRole } from '../common/user-role';
import { IsNotEmpty } from 'class-validator';

export class UserDTO {
  @Expose()
  @IsNotEmpty()
  @ApiProperty({ format: 'uuid' })
  id: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  surname: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  username: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  password: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  role: UserRole;
}
