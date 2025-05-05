import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticationServiceMock } from '@mp/common/testing';

import { ResetPasswordCommand } from './reset-password.command';
import { ResetPasswordCommandHandler } from './reset-password.command.handler';
import { AuthenticationService } from '../../../domain/service/authentication/authentication.service';

describe('ResetPasswordCommandHandler', () => {
  let handler: ResetPasswordCommandHandler;
  let authenticationServiceMock: AuthenticationServiceMock;

  beforeEach(async () => {
    authenticationServiceMock = new AuthenticationServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordCommandHandler,
        {
          provide: AuthenticationService,
          useValue: authenticationServiceMock,
        },
      ],
    }).compile();

    handler = module.get<ResetPasswordCommandHandler>(
      ResetPasswordCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should call resetPasswordAsync on the service with the correct parameters', async () => {
      // Arrange
      const token = 'mocked-token';
      const resetPasswordDto = {
        password: 'new-password',
      };

      const query = new ResetPasswordCommand(
        `Bearer ${token}`,
        resetPasswordDto,
      );

      // Act
      await handler.execute(query);

      // Assert
      expect(authenticationServiceMock.resetPasswordAsync).toHaveBeenCalledWith(
        token,
        resetPasswordDto.password,
      );
    });
  });
});
