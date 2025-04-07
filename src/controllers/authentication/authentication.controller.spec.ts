import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { UserCreationDto, UserSignInDto } from '@mp/common/dtos';
import { AuthenticationController } from './authentication.controller';
import { SignInCommand } from './command/sign-in.command';
import { SignUpCommand } from './command/sign-up.command';
import {
  AuthenticationServiceMock,
  CommandBusMock,
  RegistrationRequestDomainServiceMock,
  RegistrationRequestStatusServiceMock,
  userCreationDtoMock,
  UserServiceMock,
  userSignInDtoMock,
} from '@mp/common/testing';
import { AuthenticationService } from '../../domain/service/authentication/authentication.service';
import { UserService } from '../../domain/service/user/user.service';
import { RegistrationRequestDomainService } from '../../domain/service/registration-request/registration-request-domain.service';
import { RegistrationRequestStatusService } from '../../domain/service/registration-request-status/registration-request-status.service';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let authenticationServiceMock: AuthenticationServiceMock;
  let userServiceMock: UserServiceMock;
  let registrationRequestServiceMock: RegistrationRequestDomainServiceMock;
  let registrationRequestStatusServiceMock: RegistrationRequestStatusServiceMock;
  let commandBusMock: CommandBusMock;

  beforeEach(async () => {
    authenticationServiceMock = new AuthenticationServiceMock();
    userServiceMock = new UserServiceMock();
    registrationRequestServiceMock = new RegistrationRequestDomainServiceMock();
    registrationRequestStatusServiceMock =
      new RegistrationRequestStatusServiceMock();
    commandBusMock = new CommandBusMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: CommandBus,
          useValue: commandBusMock,
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
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
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
});
