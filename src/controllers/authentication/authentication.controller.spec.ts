import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { AuthenticationServiceModule } from '../../domain/service/authentication/authentication.service.module';
import { AuthenticationController } from './authentication.controller';
import { SignUpCommandHandler } from './command/sign-up.command.handler';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;

  beforeEach(async () => {
    const commandHandlers = [SignUpCommandHandler];

    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthenticationServiceModule],
      controllers: [AuthenticationController],
      providers: [...commandHandlers, CommandBus],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
