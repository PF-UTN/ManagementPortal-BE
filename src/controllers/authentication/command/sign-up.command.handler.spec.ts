import { RegistrationRequestStatusId } from '@mp/common/constants';
import {
  RegistrationRequestDomainServiceMock,
  userCreationDtoMock,
  UserServiceMock,
} from '@mp/common/testing';
import { Test, TestingModule } from '@nestjs/testing';

import { SignUpCommand } from './sign-up.command';
import { SignUpCommandHandler } from './sign-up.command.handler';
import { RegistrationRequestDomainService } from '../../../domain/service/registration-request/registration-request-domain.service';
import { UserService } from '../../../domain/service/user/user.service';

describe('SignUpCommandHandler', () => {
  let handler: SignUpCommandHandler;
  let userServiceMock: UserServiceMock;
  let registrationRequestServiceMock: RegistrationRequestDomainServiceMock;

  beforeEach(async () => {
    userServiceMock = new UserServiceMock();
    registrationRequestServiceMock = new RegistrationRequestDomainServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignUpCommandHandler,
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: RegistrationRequestDomainService,
          useValue: registrationRequestServiceMock,
        },
      ],
    }).compile();

    handler = module.get<SignUpCommandHandler>(SignUpCommandHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call createUserAsync and createRegistrationRequestAsync with correct parameters', async () => {
    // Arrange
    const command = new SignUpCommand(userCreationDtoMock);
    const user = { id: 'user-id' };
    userServiceMock.createUserAsync.mockResolvedValue(user);

    // Act
    await handler.execute(command);

    // Assert
    expect(userServiceMock.createUserAsync).toHaveBeenCalledWith(
      command.userCreationDto,
    );
    expect(
      registrationRequestServiceMock.createRegistrationRequestAsync,
    ).toHaveBeenCalledWith({
      user: { connect: { id: user.id } },
      status: { connect: { id: RegistrationRequestStatusId.Pending } },
    });
  });

  it('should return the created user', async () => {
    // Arrange
    const command = new SignUpCommand(userCreationDtoMock);
    const user = { id: 'user-id' };
    userServiceMock.createUserAsync.mockResolvedValue(user);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result).toEqual(user);
  });
});
