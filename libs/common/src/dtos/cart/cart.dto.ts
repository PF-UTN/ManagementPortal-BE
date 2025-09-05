import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { ProductDetailsDto } from '../products';

export class CartItemDto {
  @ApiProperty({
    type: () => ProductDetailsDto,
    required: true,
  })
  @ValidateNested()
  @Type(() => ProductDetailsDto)
  product: ProductDetailsDto;

  @ApiProperty({
    example: 2,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CartDto {
  @ApiProperty({
    example: 'cart:12345',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  cartId: string;

  @ApiProperty({
    type: [CartItemDto],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}
