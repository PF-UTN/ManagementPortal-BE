import { DeleteProductFromCartDto } from '@mp/common/dtos';

export class DeleteProductCartCommand {
  constructor(
    public readonly cartId: number,
    public readonly deleteProductFromCartDto: DeleteProductFromCartDto,
  ) {}
}
