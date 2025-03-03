import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { UserCreationDto } from './dto/user-creation.dto';
import { UserSignInDto } from './dto/user-sign-in.dto';
import { SignUpCommand } from './command/sign-up.command';
import { SignInCommand } from './command/sign-in.command';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('signup')
  @ApiOperation({ summary: 'User signup', description: 'Registers a new user' })
  @ApiBody({ type: UserCreationDto })
  async signUpAsync(@Body() userCreationDto: UserCreationDto) {
    return this.commandBus.execute(new SignUpCommand(userCreationDto));
  }

  @Post('signin')
  @ApiOperation({ summary: 'User signin', description: 'Logs in a user' })
  @ApiBody({ type: UserSignInDto })
  async signInAsync(@Body() userSignInDto: UserSignInDto) {
    return this.commandBus.execute(new SignInCommand(userSignInDto));
  }
}
