import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SignUpDto } from './dto/sign-up.dto';
import { SignUpCommand } from './command/sign-up.command';

@Controller('authentication')
export class AuthenticationController {
  constructor(private commandBus: CommandBus) {}

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.commandBus.execute(new SignUpCommand(signUpDto));
  }
}
