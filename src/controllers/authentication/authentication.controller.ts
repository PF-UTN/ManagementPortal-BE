import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { SignUpCommand } from './command/sign-up.command';
import { SignInCommand } from './command/sign-in.command';
import { UserCreationDto, UserSignInDto } from '@mp/common/dtos';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('signup')
  @ApiOperation({ summary: 'User signup', description: 'Registers a new user and creates a registration request' })
  @ApiBody({ type: UserCreationDto })
  async signUpAsync(@Body() userCreationDto: UserCreationDto) {
    return this.commandBus.execute(new SignUpCommand(userCreationDto));
  }

  @Post('signin')
  @ApiOperation({ summary: 'User signin', description: 'Logs in a user' })
  @ApiBody({ type: UserSignInDto })
  async signInAsync(
    @Body() userSignInDto: UserSignInDto,
  ): Promise<{ access_token: string }> {
    return this.commandBus.execute(new SignInCommand(userSignInDto));
  }
}
