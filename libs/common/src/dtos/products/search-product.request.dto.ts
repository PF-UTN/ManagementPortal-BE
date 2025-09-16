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

import { ProductSortDto } from './product-order.dto';
import { SearchProductFiltersDto } from './search-product-filters.dto';

export class SearchProductRequest {
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
  @Min(1)
  page: number;

  @ApiProperty({
    example: 10,
    description: 'The number of items per page',
  })
  @IsNumber()
  @Min(1)
  pageSize: number;

  @ApiProperty({
    type: SearchProductFiltersDto,
    description: 'Filters to apply to the search',
    required: false,
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => SearchProductFiltersDto)
  filters: SearchProductFiltersDto;

  @ApiPropertyOptional({
    description: 'Order for the results',
    type: ProductSortDto,
    example: { field: 'name', direction: 'asc' },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductSortDto)
  orderBy?: ProductSortDto;
}
