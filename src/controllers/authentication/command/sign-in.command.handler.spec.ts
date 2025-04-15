import { UserSignInResponse } from '@mp/common/dtos';
import {
  AuthenticationServiceMock,
  userSignInDtoMock,
} from '@mp/common/testing';
import { Test, TestingModule } from '@nestjs/testing';

import { SignInCommand } from './sign-in.command';
import { SignInCommandHandler } from './sign-in.command.handler';
import { AuthenticationService } from '../../../domain/service/authentication/authentication.service';

describe('SignInCommandHandler', () => {
  let handler: SignInCommandHandler;
  let authenticationServiceMock: AuthenticationServiceMock;

  beforeEach(async () => {
    authenticationServiceMock = new AuthenticationServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInCommandHandler,
        {
          provide: AuthenticationService,
          useValue: authenticationServiceMock,
        },
      ],
    }).compile();

    handler = module.get<SignInCommandHandler>(SignInCommandHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call signInAsync with correct parameters', async () => {
    // Arrange
    const command = new SignInCommand(userSignInDtoMock);
    const expectedResponse = new UserSignInResponse({
      access_token: 'mocked-token',
    });
    authenticationServiceMock.signInAsync.mockResolvedValue(
      expectedResponse.access_token,
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(authenticationServiceMock.signInAsync).toHaveBeenCalledWith(
      command.userSignInDto.email,
      command.userSignInDto.password,
    );
  });

  it('should return a token if signInAsync is successful', async () => {
    // Arrange
    const command = new SignInCommand(userSignInDtoMock);
    const expectedResponse = new UserSignInResponse({
      access_token: 'mocked-token',
    });
    authenticationServiceMock.signInAsync.mockResolvedValue(
      expectedResponse.access_token,
    );

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result).toEqual(expectedResponse);
  });
});
