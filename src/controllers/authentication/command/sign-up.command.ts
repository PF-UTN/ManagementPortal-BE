import { Command } from '@nestjs/cqrs';
import { User } from '@prisma/client';

import { UserCreationDto } from '@mp/common/dtos';

export class SignUpCommand extends Command<User> {
  constructor(public readonly userCreationDto: UserCreationDto) {
    super();
  }
}
