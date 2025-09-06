import { Query } from '@nestjs/cqrs';

import { CartDto } from '@mp/common/dtos';

export class GetCartByIdQuery extends Query<CartDto> {
  constructor(public readonly authorizationHeader: string) {
    super();
  }
}
