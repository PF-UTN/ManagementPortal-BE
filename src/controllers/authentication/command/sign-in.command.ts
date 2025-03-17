import { UserSignInDto } from '@mp/common/dtos';
import { Command } from '@nestjs/cqrs';

export class SignInCommand extends Command<{ access_token: string }> {
  constructor(public readonly userSignInDto: UserSignInDto) {
    super();
  }
}
