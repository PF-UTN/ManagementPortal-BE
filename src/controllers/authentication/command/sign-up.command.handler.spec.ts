import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { RegistrationRequestStatusId } from '@mp/common/constants';
import { UserCreationResponseDto } from '@mp/common/dtos';
import { userCreationDtoMock } from '@mp/common/testing';

import { SignUpCommand } from './sign-up.command';
import { SignUpCommandHandler } from './sign-up.command.handler';
import { UserService } from '../../../domain/service/user/user.service';

describe('SignUpCommandHandler', () => {
  let handler: SignUpCommandHandler;
  let userService: UserService;
  let user: ReturnType<
    typeof mockDeep<
      Prisma.UserGetPayload<{
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true;
                };
              };
            };
          };
          registrationRequest: true;
        };
      }>
    >
  >;
  let userCreationReturnDtoMock: ReturnType<
    typeof mockDeep<UserCreationResponseDto>
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignUpCommandHandler,
        {
          provide: UserService,
          useValue: mockDeep(UserService),
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);

    handler = module.get<SignUpCommandHandler>(SignUpCommandHandler);

    user = mockDeep<
      Prisma.UserGetPayload<{
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true;
                };
              };
            };
          };
          registrationRequest: true;
        };
      }>
    >();

    user.email = 'test@test.com';
    user.password = 'hashedPassword';
    user.id = 1;
    user.role.rolePermissions = [];
    user.registrationRequest = {
      id: 1,
      statusId: RegistrationRequestStatusId.Approved,
      userId: 1,
      requestDate: mockDeep<Date>(new Date()),
      note: null,
    };

    userCreationReturnDtoMock = mockDeep<UserCreationResponseDto>();

    userCreationReturnDtoMock.id = user.id;
    userCreationReturnDtoMock.email = user.email;
    userCreationReturnDtoMock.firstName = user.firstName;
    userCreationReturnDtoMock.lastName = user.lastName;
    userCreationReturnDtoMock.companyName = 'Test Company';
    userCreationReturnDtoMock.documentType = user.documentType;
    userCreationReturnDtoMock.documentNumber = user.documentNumber;
    userCreationReturnDtoMock.phone = user.phone;
    userCreationReturnDtoMock.taxCategoryName = 'Responsable Inscripto';
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call createClientUserWithRegistrationRequestAsync with correct parameters', async () => {
    // Arrange
    const command = new SignUpCommand(userCreationDtoMock);
    const createUserWithRegistrationRequestAsyncSpy = jest
      .spyOn(userService, 'createClientUserWithRegistrationRequestAsync')
      .mockResolvedValueOnce(userCreationReturnDtoMock);
    // Act
    await handler.execute(command);

    // Assert
    expect(createUserWithRegistrationRequestAsyncSpy).toHaveBeenCalledWith(
      command.userCreationDto,
    );
  });

  it('should return the created user', async () => {
    // Arrange
    const command = new SignUpCommand(userCreationDtoMock);
    jest
      .spyOn(userService, 'createClientUserWithRegistrationRequestAsync')
      .mockResolvedValueOnce(userCreationReturnDtoMock);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result).toEqual(userCreationReturnDtoMock);
  });
});
