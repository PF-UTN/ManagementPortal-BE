import { UserCreationDto } from '@mp/common/dtos';

export class SignUpCommand {
  constructor(public readonly userCreationDto: UserCreationDto) {}
}
