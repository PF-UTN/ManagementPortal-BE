import { UpdateCartProductQuantityDto } from '@mp/common/dtos';

export class UpdateCartProductQuantityCommand {
  constructor(
    public readonly userId: number,
    public readonly updateCartProductQuantityDto: UpdateCartProductQuantityDto,
  ) {}
}
