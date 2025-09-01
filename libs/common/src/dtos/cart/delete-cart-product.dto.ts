import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteProductFromCartDto {
  @ApiProperty({
    example: 40,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  productId: number;
}
