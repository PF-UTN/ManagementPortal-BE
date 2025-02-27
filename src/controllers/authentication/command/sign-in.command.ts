import { UserSignInDto } from "../dto/user-sign-in.dto";

export class SignInCommand {
  constructor(public readonly userSignInDto: UserSignInDto) {}
}
