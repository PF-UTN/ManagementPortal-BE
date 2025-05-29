import { Command } from '@nestjs/cqrs';

import { UserCreationDto, UserCreationResponseDto } from '@mp/common/dtos';

export class SignUpCommand extends Command<UserCreationResponseDto> {
  constructor(public readonly userCreationDto: UserCreationDto) {
    super();
  }
}
