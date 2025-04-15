import { UserSignInDto, UserSignInResponse } from '@mp/common/dtos';
import { Command } from '@nestjs/cqrs';

export class SignInCommand extends Command<UserSignInResponse> {
  constructor(public readonly userSignInDto: UserSignInDto) {
    super();
  }
}
