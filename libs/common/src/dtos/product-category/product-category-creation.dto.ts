import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class ProductCategoryCreationDto {
  @ApiProperty({
    example: 1,
    required: false,
    description:
      'ID of the product category. If not provided, a new category will be created.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  id: number | undefined;

  @ApiProperty({
    example: 'Electronics',
    required: true,
    description: 'Name of the product category.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'Category for electronic products',
    required: true,
    description: 'Description of the product category.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;
}
