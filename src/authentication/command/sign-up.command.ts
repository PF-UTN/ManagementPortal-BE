import { SignUpDto } from '../dto/sign-up.dto';

export class SignUpCommand {
  constructor(public readonly signUpDto: SignUpDto) {}
}
