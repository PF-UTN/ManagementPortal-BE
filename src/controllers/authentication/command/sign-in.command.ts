import { Command } from '@nestjs/cqrs';
import { UserSignInDto } from '../dto/user-sign-in.dto';

export class SignInCommand extends Command<{ access_token: string}> {
  constructor(public readonly userSignInDto: UserSignInDto) {
    super();
  }
}
