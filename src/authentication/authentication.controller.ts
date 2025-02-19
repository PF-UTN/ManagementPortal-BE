import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UserCreationDto } from './dto/user-creation.dto';
import { SignUpCommand } from './command/sign-up.command';

@Controller('authentication')
export class AuthenticationController {
  constructor(private commandBus: CommandBus) {}

  @Post('signup')
  async signUp(@Body() signUpDto: UserCreationDto) {
    return this.commandBus.execute(new SignUpCommand(signUpDto));
  }
}
