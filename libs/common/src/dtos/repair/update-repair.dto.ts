import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  IsInt,
} from 'class-validator';

export class UpdateRepairDto {
  @ApiProperty({ example: '1990-01-15', type: String, format: 'date' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({
    description: 'Description of the repair',
    example: 'Puncture',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Amount of performed kilometers during the repair',
    example: 25000,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  kmPerformed: number;

  @ApiProperty({
    description: 'ID of the service supplier that performed the repair',
    example: 1,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  serviceSupplierId: number;
}
