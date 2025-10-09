import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { SearchShipmentFiltersDto } from './search-shipment-filters.dto';

export class DownloadShipmentRequest {
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
    type: SearchShipmentFiltersDto,
    description: 'Filters to apply to the search',
    required: false,
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => SearchShipmentFiltersDto)
  filters: SearchShipmentFiltersDto;
}
