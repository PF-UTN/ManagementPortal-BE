import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ProductUpdateDto {
  @ApiProperty({
    example: 'Mouse Gamer Logitech G203 Lightsync Blanco',
    required: true,
  })
  @IsNotEmpty()
  @MaxLength(255)
  @IsString()
  name: string;

  @ApiProperty({
    example:
      'El mouse para juegos Logitech G203 ofrece un rendimiento preciso con una resolución de hasta 8000 DPI, 6 botones programables y una iluminación RGB LIGHTSYNC. Su diseño clásico y ligero lo hace ideal para largas sesiones de juego.',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 29.99, required: true })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  price: number;

  @ApiProperty({ example: true })
  @IsNotEmpty()
  @IsBoolean()
  enabled: boolean = true;

  @ApiProperty({ example: 29.99, required: true })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  weight: number;

  @ApiProperty({ example: 1, required: true })
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @ApiProperty({ example: 1, required: true })
  @IsNotEmpty()
  @IsNumber()
  supplierId: number;
}
