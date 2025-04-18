import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { MailingService } from '@mp/common/services';
import {
  AuthenticationServiceMock,
  MailingServiceMock,
  resetPasswordRequestDtoMock,
} from '@mp/common/testing';

import { ResetPasswordRequestQuery } from './reset-password-request.query';
import { ResetPasswordRequestQueryHandler } from './reset-password-request.query.handler';
import { AuthenticationService } from '../../../domain/service/authentication/authentication.service';

describe('ResetPasswordRequestQueryHandler', () => {
  let handler: ResetPasswordRequestQueryHandler;
  let authenticationServiceMock: AuthenticationServiceMock;
  let mailingServiceMock: MailingServiceMock;
  let configService: ConfigService;

  beforeEach(async () => {
    authenticationServiceMock = new AuthenticationServiceMock();
    mailingServiceMock = new MailingServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordRequestQueryHandler,
        {
          provide: AuthenticationService,
          useValue: authenticationServiceMock,
        },
        {
          provide: MailingService,
          useValue: mailingServiceMock,
        },
        {
          provide: ConfigService,
          useValue: mockDeep(ConfigService)
        }
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);

    handler = module.get<ResetPasswordRequestQueryHandler>(
      ResetPasswordRequestQueryHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should call requestPasswordResetAsync on the service with the correct parameters', async () => {
      // Arrange
      const resetPasswordRequestDto = {
        ...resetPasswordRequestDtoMock,
      };

      const query = new ResetPasswordRequestQuery(resetPasswordRequestDto);

      // Act
      await handler.execute(query);

      // Assert
      expect(
        authenticationServiceMock.requestPasswordResetAsync,
      ).toHaveBeenCalledWith(resetPasswordRequestDto.email);
    });

    it('should call sendPasswordResetEmailAsync on the service with the correct parameters', async () => {
      // Arrange
      const resetPasswordRequestDto = {
        ...resetPasswordRequestDtoMock,
      };
      const token = 'mocked-token';
      authenticationServiceMock.requestPasswordResetAsync.mockResolvedValue(token);
      const frontendBaseUrl = configService.get<string>('FRONTEND_BASE_URL');
      const url = `${frontendBaseUrl}/reset-password/${token}`;

      const query = new ResetPasswordRequestQuery(resetPasswordRequestDto);

      // Act
      await handler.execute(query);

      // Assert
      expect(
        mailingServiceMock.sendPasswordResetEmailAsync,
      ).toHaveBeenCalledWith(resetPasswordRequestDto.email, url);
    });
  });
});
