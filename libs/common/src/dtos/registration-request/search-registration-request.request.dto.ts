import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { SearchRegistrationRequestFiltersDto } from './search-registration-request-filters.dto';

export class SearchRegistrationRequestRequest {
  @ApiProperty({
    example: '',
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
  @IsNumber()
  @Min(1)
  pageSize: number;

  @ApiProperty({
    type: SearchRegistrationRequestFiltersDto,
    description: 'The filters to apply to the search',
    required: true,
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => SearchRegistrationRequestFiltersDto)
  filters: SearchRegistrationRequestFiltersDto;
}
