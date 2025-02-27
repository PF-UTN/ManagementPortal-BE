import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { AuthenticationController } from './authentication.controller';
import { SignUpCommandHandler } from './command/sign-up.command.handler';
import { SignInCommandHandler } from './command/sign-in.command.handler';
import { UserServiceModule } from '../../domain/service/user/user.service.module';
import { UserCreationDto } from './dto/user-creation.dto';
import { UserSignInDto } from './dto/user-sign-in.dto';
import { SignUpCommand } from './command/sign-up.command';
import { SignInCommand } from './command/sign-in.command';
import { AuthenticationServiceModule } from '../../domain/service/authentication/authentication.service.module';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const commandHandlers = [SignUpCommandHandler, SignInCommandHandler];

    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthenticationServiceModule, UserServiceModule],
      controllers: [AuthenticationController],
      providers: [...commandHandlers, CommandBus],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call commandBus.execute with SignUpCommand when signUp is called', async () => {
    const userCreationDto: UserCreationDto = { firstName: 'testFirstName', lastName: 'testLastName', email: 'testEmail@test.com', password: 'testPass', phone: '1234567890' };
    const executeSpy = jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(undefined);

    await controller.signUp(userCreationDto);

    expect(executeSpy).toHaveBeenCalledWith(new SignUpCommand(userCreationDto));
  });

  it('should call commandBus.execute with SignInCommand when signIn is called', async () => {
    const userSignInDto: UserSignInDto = { email: 'testEmail@test.com', password: 'testPass' };
    const executeSpy = jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(undefined);

    await controller.signIn(userSignInDto);

    expect(executeSpy).toHaveBeenCalledWith(new SignInCommand(userSignInDto));
  });
});
