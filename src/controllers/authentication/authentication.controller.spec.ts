import { ConfigModule } from '@nestjs/config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { RedisClientType } from 'redis';

import {
  UserCreationDto,
  UserSignInDto,
  ResetPasswordRequestDto,
} from '@mp/common/dtos';
import {
  AuthenticationServiceMock,
  CommandBusMock,
  QueryBusMock,
  RegistrationRequestDomainServiceMock,
  RegistrationRequestStatusServiceMock,
  resetPasswordRequestDtoMock,
  userCreationDtoMock,
  UserServiceMock,
  userSignInDtoMock,
} from '@mp/common/testing';

import { AuthenticationController } from './authentication.controller';
import { ResetPasswordCommand } from './command/reset-password.command';
import { SignInCommand } from './command/sign-in.command';
import { SignUpCommand } from './command/sign-up.command';
import { ResetPasswordRequestQuery } from './query/reset-password-request.query';
import { AuthenticationService } from '../../domain/service/authentication/authentication.service';
import { AuthenticationServiceModule } from '../../domain/service/authentication/authentication.service.module';
import { RegistrationRequestDomainService } from '../../domain/service/registration-request/registration-request-domain.service';
import { RegistrationRequestDomainServiceModule } from '../../domain/service/registration-request/registration-request-domain.service.module';
import { RegistrationRequestStatusService } from '../../domain/service/registration-request-status/registration-request-status.service';
import { RegistrationRequestStatusServiceModule } from '../../domain/service/registration-request-status/registration-request-status.service.module';
import { UserService } from '../../domain/service/user/user.service';
import { UserServiceModule } from '../../domain/service/user/user.service.module';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let authenticationServiceMock: AuthenticationServiceMock;
  let userServiceMock: UserServiceMock;
  let registrationRequestServiceMock: RegistrationRequestDomainServiceMock;
  let registrationRequestStatusServiceMock: RegistrationRequestStatusServiceMock;
  let commandBusMock: CommandBusMock;
  let queryBusMock: QueryBusMock;
  const redisClientMock = mockDeep<RedisClientType>();

  beforeEach(async () => {
    authenticationServiceMock = new AuthenticationServiceMock();
    userServiceMock = new UserServiceMock();
    registrationRequestServiceMock = new RegistrationRequestDomainServiceMock();
    registrationRequestStatusServiceMock =
      new RegistrationRequestStatusServiceMock();
    commandBusMock = new CommandBusMock();
    queryBusMock = new QueryBusMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AuthenticationServiceModule,
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: `${process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''}.env`,
        }),
        UserServiceModule,
        RegistrationRequestDomainServiceModule,
        RegistrationRequestStatusServiceModule,
      ],
      controllers: [AuthenticationController],
      providers: [
        {
          provide: CommandBus,
          useValue: commandBusMock,
        },
        {
          provide: QueryBus,
          useValue: queryBusMock,
        },
        {
          provide: AuthenticationService,
          useValue: authenticationServiceMock,
        },
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: RegistrationRequestDomainService,
          useValue: registrationRequestServiceMock,
        },
        {
          provide: RegistrationRequestStatusService,
          useValue: registrationRequestStatusServiceMock,
        },
        {
          provide: 'REDIS_CLIENT',
          useValue: redisClientMock,
        },
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
  });

  afterEach(async () => {
    if (redisClientMock.destroy) {
      await redisClientMock.destroy();
    }
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUpAsync', () => {
    it('should call commandBus.execute with SignUpCommand when signUpAsync is called', async () => {
      // Arrange
      const userCreationDto: UserCreationDto = { ...userCreationDtoMock };
      const executeSpy = jest
        .spyOn(commandBusMock, 'execute')
        .mockResolvedValueOnce(undefined);
      const expectedCommand = new SignUpCommand(userCreationDto);

      // Act
      await controller.signUpAsync(userCreationDto);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('signInAsync', () => {
    it('should call commandBus.execute with SignInCommand when signInAsync is called', async () => {
      // Arrange
      const userSignInDto: UserSignInDto = { ...userSignInDtoMock };
      const executeSpy = jest
        .spyOn(commandBusMock, 'execute')
        .mockResolvedValueOnce(undefined);
      const expectedCommand = new SignInCommand(userSignInDto);

      // Act
      await controller.signInAsync(userSignInDto);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('requestPasswordRecoveryAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      // Arrange
      const resetPasswordRequestDto: ResetPasswordRequestDto = {
        ...resetPasswordRequestDtoMock,
      };
      const expectedCommand = new ResetPasswordRequestQuery(
        resetPasswordRequestDto,
      );

      // Act
      await controller.requestPasswordRecoveryAsync(resetPasswordRequestDto);

      // Assert
      expect(queryBusMock.execute).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('resetPasswordAsync', () => {
    it('should call commandBus.execute with ResetPasswordCommand when resetPasswordAsync is called', async () => {
      // Arrange
      const token = 'mockToken';
      const resetPasswordDto = {
        password: 'newPassword',
        confirmPassword: 'newPassword',
      };
      const executeSpy = jest
        .spyOn(commandBusMock, 'execute')
        .mockResolvedValueOnce(undefined);
      const expectedCommand = new ResetPasswordCommand(token, resetPasswordDto);

      // Act
      await controller.resetPasswordAsync(token, resetPasswordDto);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });
});
