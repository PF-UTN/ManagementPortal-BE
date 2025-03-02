import { ApiProperty } from '@nestjs/swagger';
import { SearchRegistrationRequestFiltersDto } from './search-registration-request-filters.dto';

export class SearchRegistrationRequestRequest {
  @ApiProperty({
    example: 'search text',
    description: 'The text to search for',
  })
  searchText: string;

  @ApiProperty({ example: 1, description: 'The page number for pagination' })
  page: number;

  @ApiProperty({ example: 10, description: 'The number of items per page' })
  pageSize: number;

  @ApiProperty({
    type: SearchRegistrationRequestFiltersDto,
    description: 'The filters to apply to the search',
  })
  filters: SearchRegistrationRequestFiltersDto;
}
