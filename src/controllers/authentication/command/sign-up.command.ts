import { UserCreationDto } from '@mp/common/dtos';
import { Command } from '@nestjs/cqrs';
import { User } from '../../../domain/entity/user.entity';

export class SignUpCommand extends Command<User> {
  constructor(public readonly userCreationDto: UserCreationDto) {
    super();
  }
}
