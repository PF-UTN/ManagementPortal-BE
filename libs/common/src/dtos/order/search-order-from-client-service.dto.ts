import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNumber,
  IsString,
  MaxLength,
  ValidateNested,
  IsOptional,
} from 'class-validator';

import { OrderSortDto } from './order-order.dto';
import { SearchOrderFromClientFiltersDto } from './search-order-from-client-filters.dto';

export class SearchOrderFromClientServiceDto {
  @ApiProperty({
    example: 1,
    description: 'User ID extracted from JWT',
  })
  @IsNumber()
  clientId: number;

  @ApiProperty({
    example: 'search text',
    description: 'The text to search for',
  })
  @IsDefined()
  @IsString()
  @MaxLength(255)
  searchText: string;

  @ApiProperty({
    example: 1,
    description: 'The page number for pagination',
  })
  @IsNumber()
  page: number;

  @ApiProperty({
    example: 10,
    description: 'The number of items per page',
  })
  @IsNumber()
  pageSize: number;

  @ApiProperty({
    type: SearchOrderFromClientFiltersDto,
    description: 'Filters to apply to the search',
    required: false,
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => SearchOrderFromClientFiltersDto)
  filters: SearchOrderFromClientFiltersDto;

  @ApiPropertyOptional({
    description: 'Order for the results',
    type: OrderSortDto,
    example: { field: 'createdAt', direction: 'asc' },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OrderSortDto)
  orderBy?: OrderSortDto;
}
