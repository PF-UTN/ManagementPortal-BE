import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  IsOptional,
} from 'class-validator';

import { IsImageFile } from '../../validators/image-file.validator';

export class ProductUpdateDto {
  @ApiProperty({
    example: 'Mouse Gamer Logitech G203 Lightsync Blanco',
    description: 'Product name',
    required: true,
  })
  @IsNotEmpty()
  @MaxLength(255)
  @IsString()
  name: string;

  @ApiProperty({
    example:
      'El mouse para juegos Logitech G203 ofrece un rendimiento preciso con una resolución de hasta 8000 DPI, 6 botones programables y una iluminación RGB LIGHTSYNC. Su diseño clásico y ligero lo hace ideal para largas sesiones de juego.',
    description: 'Product description',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: 29.99,
    description: 'Product price',
    required: true,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  price: number;

  @ApiProperty({
    example: true,
    description: 'Whether the product is enabled',
  })
  @IsNotEmpty()
  @Type(() => Boolean)
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({
    example: 1.5,
    description: 'Product weight in kg',
    required: true,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  weight: number;

  @ApiProperty({
    example: 1,
    description: 'Product category ID',
    required: true,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  categoryId: number;

  @ApiProperty({
    example: 1,
    description: 'Supplier ID',
    required: true,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  supplierId: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Product image file (JPEG, PNG, WebP)',
    required: false,
  })
  @IsOptional()
  @IsImageFile()
  image?: Express.Multer.File;
}
