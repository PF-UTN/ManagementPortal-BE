import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class SearchPurchaseOrderFiltersDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: 'Filter by purchase order status ID',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true }) 
  statusId?: number[];

  @ApiProperty({
    example: ['Supplier A', 'Supplier B'],
    description: 'Filter by purchase order supplier business name',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supplierBusinessName?: string[];

  @ApiProperty({
    example: '2024-07-01',
    description: 'Start date for creation date filter (inclusive)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({
    example: '2024-07-31',
    description: 'End date for creation date filter (inclusive)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiProperty({
    example: '2024-07-05',
    description: 'Start date for delivery date filter (inclusive)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fromEffectiveDeliveryDate?: string;

  @ApiProperty({
    example: '2024-07-20',
    description: 'End date for delivery date filter (inclusive)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  toEffectiveDeliveryDate?: string;
}
