import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { UserCreationDto, UserSignInDto } from '@mp/common/dtos';
import { AuthenticationController } from './authentication.controller';
import { UserServiceModule } from '../../domain/service/user/user.service.module';
import { AuthenticationServiceModule } from '../../domain/service/authentication/authentication.service.module';
import { SignInCommand } from './command/sign-in.command';
import { SignInCommandHandler } from './command/sign-in.command.handler';
import { SignUpCommand } from './command/sign-up.command';
import { SignUpCommandHandler } from './command/sign-up.command.handler';
import { RegistrationRequestStatusServiceModule } from '../../domain/service/registration-request-status/registration-request-status.service.module';
import { RegistrationRequestDomainServiceModule } from '../../domain/service/registration-request/registration-request-domain.service.module';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const commandHandlers = [SignUpCommandHandler, SignInCommandHandler];

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
        ...commandHandlers,
        { provide: CommandBus, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUpAsync', () => {
    it('should call commandBus.execute with SignUpCommand when signUpAsync is called', async () => {
      // Arrange
      const userCreationDto: UserCreationDto = {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        email: 'testEmail@test.com',
        password: 'testPass',
        phone: '1234567890',
        documentNumber: '123456789',
        documentType: 'DNI',
      };
      const executeSpy = jest
        .spyOn(commandBus, 'execute')
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
      const userSignInDto: UserSignInDto = {
        email: 'testEmail@test.com',
        password: 'testPass',
      };
      const executeSpy = jest
        .spyOn(commandBus, 'execute')
        .mockResolvedValueOnce(undefined);
      const expectedCommand = new SignInCommand(userSignInDto);

      // Act
      await controller.signInAsync(userSignInDto);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });
});
