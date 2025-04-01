import { ApiProperty } from '@nestjs/swagger';
import { SearchRegistrationRequestFiltersDto } from './search-registration-request-filters.dto';
import { IsDefined, IsNumber, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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
  page: number;

  @ApiProperty({
    example: 10,
    description: 'The number of items per page',
    required: false,
  })
  @IsNumber()
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
