import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

import { Public, RequiredPermissions } from '@mp/common/decorators';
import {
  UserCreationDto,
  UserSignInDto,
  UserSignInResponse,
  ResetPasswordRequestDto,
  ResetPasswordDto,
} from '@mp/common/dtos';

import { ResetPasswordCommand } from './command/reset-password.command';
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
  ): Promise<UserSignInResponse> {
    return this.commandBus.execute(new SignInCommand(userSignInDto));
  }

  @Public()
  @HttpCode(200)
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

  @Post('reset-password')
  @HttpCode(200)
  @RequiredPermissions()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reset password',
    description: 'Resets the password for the user with the provided token.',
  })
  @ApiBody({ type: ResetPasswordDto })
  async resetPasswordAsync(
    @Headers('Authentication') authenticationHeader: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.commandBus.execute(
      new ResetPasswordCommand(authenticationHeader, resetPasswordDto),
    );
  }
}
