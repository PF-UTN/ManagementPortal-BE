import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

import { StockChangedField } from '@mp/common/constants';

export class StockChangeChangesDto {
  @ApiProperty({ example: 'Available' })
  @IsString()
  @IsNotEmpty()
  @IsEnum(StockChangedField)
  changedField: StockChangedField;

  @ApiProperty({
    description: 'Previous stock level',
    example: 1,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  previousValue: number;

  @ApiProperty({
    description: 'New stock level',
    example: 1,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  newValue: number;
}
