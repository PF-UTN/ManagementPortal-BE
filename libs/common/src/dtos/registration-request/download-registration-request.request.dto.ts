import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { SearchRegistrationRequestFiltersDto } from './search-registration-request-filters.dto';

export class DownloadRegistrationRequestRequest {
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
    type: SearchRegistrationRequestFiltersDto,
    description: 'The filters to apply to the search',
    required: true,
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => SearchRegistrationRequestFiltersDto)
  filters: SearchRegistrationRequestFiltersDto;
}
