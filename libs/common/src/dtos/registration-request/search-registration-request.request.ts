import { ApiProperty } from '@nestjs/swagger';
import { SearchRegistrationRequestFiltersDto } from './search-registration-request-filters.dto';
import { IsNumber, IsString, MaxLength } from 'class-validator';

export class SearchRegistrationRequestRequest {
  @ApiProperty({
    example: 'search text',
    description: 'The text to search for',
    required: false,
  })
  @IsString()
  @MaxLength(50)
  searchText: string;

  @ApiProperty({
    example: 1,
    description: 'The page number for pagination',
    required: true,
  })
  @IsNumber()
  page: number;

  @ApiProperty({
    example: 10,
    description: 'The number of items per page',
    required: true,
  })
  @IsNumber()
  pageSize: number;

  @ApiProperty({
    type: SearchRegistrationRequestFiltersDto,
    description: 'The filters to apply to the search',
    required: false,
  })
  filters: SearchRegistrationRequestFiltersDto;
}
