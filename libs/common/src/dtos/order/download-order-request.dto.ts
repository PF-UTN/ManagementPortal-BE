import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsString,
  MaxLength,
  ValidateNested,
  IsOptional,
} from 'class-validator';

import { OrderSortDto } from './order-sort.dto';
import { SearchOrderFiltersDto } from './search-order-filters.dto';

export class DownloadOrderRequest {
  @ApiProperty({
    example: 'search text',
    description: 'The text to search for',
    required: true,
  })
  @IsDefined()
  @IsString()
  @MaxLength(255)
  searchText: string;

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
    example: { field: 'createdAt', direction: 'asc' },
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OrderSortDto)
  orderBy?: OrderSortDto;
}
