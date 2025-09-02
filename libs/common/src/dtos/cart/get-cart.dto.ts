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

export class CartItem2 {
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

export class Cart2 {
  @ApiProperty({
    example: 'cart:12345',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  cartId: string;

  @ApiProperty({
    type: [CartItem2],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItem2)
  items: CartItem2[];
}
