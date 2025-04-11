import { ResetPasswordRequestDto } from '@mp/common/dtos';
import { Query } from '@nestjs/cqrs';

export class ResetPasswordRequestQuery extends Query<void> {
  constructor(
    public readonly resetPasswordRequestDto: ResetPasswordRequestDto,
  ) {
    super();
  }
}
