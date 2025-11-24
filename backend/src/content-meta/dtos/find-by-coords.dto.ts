import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsNumber, Max, Min } from 'class-validator';

export class FindByCoordsDTO {
  @ApiProperty({ description: 'Latitude (-90 to 90)' })
  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({ description: 'Longitude (-180 to 180)' })
  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lon: number;
}
