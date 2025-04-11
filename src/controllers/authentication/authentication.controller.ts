import { Public } from '@mp/common/decorators';
import {
  UserCreationDto,
  UserSignInDto,
  ResetPasswordRequestDto,
} from '@mp/common/dtos';
import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiBody } from '@nestjs/swagger';

import { SignInCommand } from './command/sign-in.command';
import { SignUpCommand } from './command/sign-up.command';
import { ResetPasswordRequestQuery } from './query/reset-password-request.query';

@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Post('signup')
  @ApiOperation({
    summary: 'User signup',
    description: 'Registers a new user and creates a registration request',
  })
  @ApiBody({ type: UserCreationDto })
  async signUpAsync(@Body() userCreationDto: UserCreationDto) {
    return this.commandBus.execute(new SignUpCommand(userCreationDto));
  }

  @Public()
  @Post('signin')
  @ApiOperation({ summary: 'User signin', description: 'Logs in a user' })
  @ApiBody({ type: UserSignInDto })
  async signInAsync(
    @Body() userSignInDto: UserSignInDto,
  ): Promise<{ access_token: string }> {
    return this.commandBus.execute(new SignInCommand(userSignInDto));
  }

  @Public()
  @Post('reset-password/request')
  @ApiOperation({
    summary: 'Request password recovery',
    description:
      'Sends a password recovery email to the user with the provided email address.',
  })
  @ApiBody({ type: ResetPasswordRequestDto })
  async requestPasswordRecoveryAsync(
    @Body() resetPasswordRequestDto: ResetPasswordRequestDto,
  ) {
    return this.queryBus.execute(
      new ResetPasswordRequestQuery(resetPasswordRequestDto),
    );
  }
}
