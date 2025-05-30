import { Command } from '@nestjs/cqrs';

import { UserCreationDto, UserCreationResponse } from '@mp/common/dtos';

export class SignUpCommand extends Command<UserCreationResponse> {
  constructor(public readonly userCreationDto: UserCreationDto) {
    super();
  }
}
