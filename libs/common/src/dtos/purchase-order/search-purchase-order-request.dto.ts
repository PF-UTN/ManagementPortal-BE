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

import { PurchaseOrderSortDto } from './purchase-order-order.dto';
import { SearchPurchaseOrderFiltersDto } from './search-purchase-order-filters.dto';

export class SearchPurchaseOrderRequest {
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
    type: SearchPurchaseOrderFiltersDto,
    description: 'Filters to apply to the search',
    required: false,
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => SearchPurchaseOrderFiltersDto)
  filters: SearchPurchaseOrderFiltersDto;

  @ApiPropertyOptional({
    description: 'Order for the results',
    type: PurchaseOrderSortDto,
    example: { field: 'createdAt', direction: 'asc' },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PurchaseOrderSortDto)
  orderBy?: PurchaseOrderSortDto;
}
