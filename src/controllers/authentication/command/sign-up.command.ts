import { UserCreationDto } from '../dto/user-creation.dto';

export class SignUpCommand {
  constructor(public readonly userCreationDto: UserCreationDto) {}
}
