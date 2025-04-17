import { Command } from '@nestjs/cqrs';

import { UserSignInDto, UserSignInResponse } from '@mp/common/dtos';

export class SignInCommand extends Command<UserSignInResponse> {
  constructor(public readonly userSignInDto: UserSignInDto) {
    super();
  }
}
