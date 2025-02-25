import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { UserCreationDto } from './dto/user-creation.dto';
import { SignUpCommand } from './command/sign-up.command';

@Controller('authentication')
export class AuthenticationController {
  constructor(private commandBus: CommandBus) {}

  @Post('signup')
  @ApiOperation({ summary: 'User signup', description: 'Registers a new user' })
  @ApiBody({ type: UserCreationDto })
  async signUp(@Body() userCreationDto: UserCreationDto) {
    return this.commandBus.execute(new SignUpCommand(userCreationDto));
  }
}
