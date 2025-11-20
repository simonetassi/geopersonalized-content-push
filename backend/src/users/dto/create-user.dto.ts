import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../common/user-role';

export class CreateUserDTO {
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

  @IsEnum(UserRole, {
    message: 'role must be one of the following values: user, admin',
  })
  @IsOptional()
  @ApiPropertyOptional({ enum: UserRole, default: UserRole.USER })
  role?: UserRole;
}
