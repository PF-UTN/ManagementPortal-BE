import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { StockChangeChangesDto } from './stock-change-changes.dto';

export class CreateManyStockChangeDto {
  @ApiProperty({
    description: 'ID of the product whose stock is changed',
    example: 1,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  productId: number;

  @ApiProperty({ type: [StockChangeChangesDto] })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => StockChangeChangesDto)
  changes: StockChangeChangesDto[];

  @ApiProperty({
    description: 'The reason for the stock change',
    example: 'Restock after inventory audit',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  reason: string;
}
