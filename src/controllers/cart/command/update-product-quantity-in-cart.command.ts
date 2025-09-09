import { UpdateCartProductQuantityDto } from '@mp/common/dtos';

export class UpdateCartProductQuantityCommand {
  constructor(
    public readonly authorizationHeader: string,
    public readonly updateCartProductQuantityDto: UpdateCartProductQuantityDto,
  ) {}
}
