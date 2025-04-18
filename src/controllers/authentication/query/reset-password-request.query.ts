import { Query } from '@nestjs/cqrs';

import { ResetPasswordRequestDto } from '@mp/common/dtos';

export class ResetPasswordRequestQuery extends Query<void> {
  constructor(
    public readonly resetPasswordRequestDto: ResetPasswordRequestDto,
  ) {
    super();
  }
}
