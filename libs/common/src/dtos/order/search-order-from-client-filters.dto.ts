import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { DeliveryMethodId } from '@mp/common/constants';

export class SearchOrderFromClientFiltersDto {
  @ApiProperty({
    example: ['Cancelled', 'Pending'],
    description: 'Filter by order status name',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  statusName?: string[];

  @ApiProperty({ example: [1, 2], required: true })
  @IsOptional()
  @IsNumber({}, { each: true })
  @IsEnum(DeliveryMethodId, { each: true })
  deliveryMethodId: DeliveryMethodId[];

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
}
