import { DeleteProductFromCartDto } from 'libs/common/src/dtos/cart/delete-cart-product.dto';

export class DeleteProductCartCommand {
  constructor(
    public readonly cartId: number,
    public readonly deleteProductFromCartDto: DeleteProductFromCartDto,
  ) {}
}
