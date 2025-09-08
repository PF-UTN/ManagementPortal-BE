import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsString,
  MaxLength,
  ValidateNested,
  IsOptional,
} from 'class-validator';

import { ProductSortDto } from './product-order.dto';
import { SearchProductFiltersDto } from './search-product-filters.dto';

export class DownloadProductRequest {
  @ApiProperty({
    example: 'search text',
    description: 'The text to search for',
  })
  @IsDefined()
  @IsString()
  @MaxLength(255)
  searchText: string;

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
