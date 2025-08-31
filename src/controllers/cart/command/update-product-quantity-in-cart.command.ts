import { UpdateCartProductQuantityDto } from '@mp/common/dtos';

export class UpdateCartProductQuantityCommand {
  constructor(
    public readonly cartId: number,
    public readonly updateCartProductQuantityDto: UpdateCartProductQuantityDto,
  ) {}
}
