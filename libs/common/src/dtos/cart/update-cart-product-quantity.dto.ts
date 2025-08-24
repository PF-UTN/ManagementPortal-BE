import { IsNumber, Min } from 'class-validator';

export class UpdateCartProductQuantityDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}
