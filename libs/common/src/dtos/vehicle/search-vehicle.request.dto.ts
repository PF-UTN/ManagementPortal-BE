import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNumber, IsString, MaxLength } from 'class-validator';

export class SearchVehicleRequest {
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
}
