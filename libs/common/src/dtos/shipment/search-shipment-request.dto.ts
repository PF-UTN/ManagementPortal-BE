import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNumber,
  IsString,
  MaxLength,
  ValidateNested,
  Min,
} from 'class-validator';

import { SearchShipmentFiltersDto } from './search-shipment-filters.dto';

export class SearchShipmentRequest {
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
    type: SearchShipmentFiltersDto,
    description: 'Filters to apply to the search',
    required: false,
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => SearchShipmentFiltersDto)
  filters: SearchShipmentFiltersDto;
}
