import { DeleteProductFromCartDto } from '@mp/common/dtos';

export class DeleteProductCartCommand {
  constructor(
    public readonly authorizationHeader: string,
    public readonly deleteProductFromCartDto: DeleteProductFromCartDto,
  ) {}
}
