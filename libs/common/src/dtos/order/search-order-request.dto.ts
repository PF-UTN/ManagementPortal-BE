import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNumber,
  IsString,
  MaxLength,
  ValidateNested,
  IsOptional,
  Min,
} from 'class-validator';

import { OrderSortDto } from './order-sort.dto';
import { SearchOrderFiltersDto } from './search-order-filters.dto';

export class SearchOrderRequest {
  @ApiProperty({
    example: 'search text',
    description: 'The text to search for',
    required: true,
  })
  @IsDefined()
  @IsString()
  @MaxLength(50)
  searchText: string;

  @ApiProperty({
    example: 1,
    description: 'The page number for pagination',
    required: false,
  })
  @IsNumber()
  @Min(1)
  page: number;

  @ApiProperty({
    example: 10,
    description: 'The number of items per page',
    required: false,
  })
  @Min(1)
  @IsNumber()
  pageSize: number;

  @ApiProperty({
    type: SearchOrderFiltersDto,
    description: 'Filters to apply to the search',
    required: false,
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => SearchOrderFiltersDto)
  filters: SearchOrderFiltersDto;

  @ApiPropertyOptional({
    description: 'Order for the results',
    type: OrderSortDto,
    example: { field: 'createdAt', direction: 'desc' },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OrderSortDto)
  orderBy?: OrderSortDto;
}
