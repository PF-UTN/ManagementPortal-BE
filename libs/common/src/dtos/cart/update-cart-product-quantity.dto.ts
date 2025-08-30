import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateCartProductQuantityDto {
  @ApiProperty({
    example: 40,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty({
    example: 5,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}
