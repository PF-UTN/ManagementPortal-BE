import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class SearchOrderFiltersDto {
  @ApiProperty({
    example: ['Pending', 'Shipped'],
    description: 'Filter by order status name',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  statusName?: string[];

  @ApiProperty({
    example: '2024-07-01',
    description:
      'Start date of creation filter (records on or after this date)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fromCreatedAtDate?: string;

  @ApiProperty({
    example: '2024-07-31',
    description: 'End date of creation filter (records on or before this date)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  toCreatedAtDate?: string;

  @ApiProperty({
    example: '1',
    description: 'Filter by shipment ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  shipmentId?: number;
}
