import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsString,
  MaxLength,
  ValidateNested,
  IsOptional,
} from 'class-validator';

import { PurchaseOrderSortDto } from './purchase-order-order.dto';
import { SearchPurchaseOrderFiltersDto } from './search-purchase-order-filters.dto';

export class DownloadPurchaseOrderRequest {
  @ApiProperty({
    example: 'search text',
    description: 'The text to search for',
  })
  @IsDefined()
  @IsString()
  @MaxLength(255)
  searchText: string;

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
