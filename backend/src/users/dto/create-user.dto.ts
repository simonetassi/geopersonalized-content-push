import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRole } from '../common/user-role';

export class CreateUserDTO {
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

  @IsEnum(UserRole, {
    message: 'role must be one of the following values: user, admin',
  })
  @IsOptional()
  @ApiPropertyOptional({ enum: UserRole, default: UserRole.USER })
  role?: UserRole;
}
