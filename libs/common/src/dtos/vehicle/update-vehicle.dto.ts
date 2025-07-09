import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsPositive,
  MaxLength,
} from 'class-validator';

export class UpdateVehicleDto {
  @ApiProperty({
    description: 'Brand of the vehicle',
    example: 'Toyota',
    maxLength: 50,
  })
  @IsNotEmpty()
  @MaxLength(50)
  brand: string;

  @ApiProperty({
    description: 'Model of the vehicle',
    example: 'Corolla',
    maxLength: 50,
  })
  @IsNotEmpty()
  @MaxLength(50)
  model: string;

  @ApiProperty({
    description: 'Amount of traveled kilometers',
    example: 25000,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  kmTraveled: number;

  @ApiProperty({ example: '1990-01-15', type: String, format: 'date' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  admissionDate: Date;

  @ApiProperty({
    description: 'Indicates if the vehicle is enabled',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  enabled: boolean;
}
