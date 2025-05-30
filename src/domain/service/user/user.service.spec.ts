import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { RegistrationRequestStatusId, RoleIds } from '@mp/common/constants';
import { UserCreationResponse } from '@mp/common/dtos';
import { EncryptionService } from '@mp/common/services';
import { userCreationDtoMock, userMock } from '@mp/common/testing';
import {
  ClientRepository,
  PrismaUnitOfWork,
  RegistrationRequestRepository,
  UserRepository,
} from '@mp/repository';

import { UserService } from '../user/user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;
  let encryptionService: EncryptionService;
  let registrationRequestRepository: RegistrationRequestRepository;
  let clientRepository: ClientRepository;
  let unitOfWork: PrismaUnitOfWork;
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
    typeof mockDeep<UserCreationResponse>
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockDeep(UserRepository) },
        { provide: EncryptionService, useValue: mockDeep(EncryptionService) },
        {
          provide: RegistrationRequestRepository,
          useValue: mockDeep(RegistrationRequestRepository),
        },
        {
          provide: ClientRepository,
          useValue: mockDeep(ClientRepository),
        },
        { provide: PrismaUnitOfWork, useValue: mockDeep(PrismaUnitOfWork) },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    encryptionService = module.get<EncryptionService>(EncryptionService);
    registrationRequestRepository = module.get<RegistrationRequestRepository>(
      RegistrationRequestRepository,
    );
    clientRepository = module.get<ClientRepository>(ClientRepository);
    unitOfWork = module.get<PrismaUnitOfWork>(PrismaUnitOfWork);

    service = module.get<UserService>(UserService);

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

    userCreationReturnDtoMock = mockDeep<UserCreationResponse>();

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
    expect(service).toBeDefined();
  });

  describe('createUserAsync', () => {
    it('should call createUserAsync with a hashed password', async () => {
      // Arrange
      const userCreationDto = {
        firstName: userCreationDtoMock.firstName,
        lastName: userCreationDtoMock.lastName,
        email: userCreationDtoMock.email,
        password: userCreationDtoMock.password,
        phone: userCreationDtoMock.phone,
        documentType: userCreationDtoMock.documentType,
        documentNumber: userCreationDtoMock.documentNumber,
        street: userCreationDtoMock.street,
        streetNumber: userCreationDtoMock.streetNumber,
        townId: userCreationDtoMock.townId,
      };
      const hashedPassword = 'hashedPassword123';
      jest
        .spyOn(encryptionService, 'hashAsync')
        .mockResolvedValue(hashedPassword);

      const expectedUser = {
        firstName: userCreationDtoMock.firstName,
        lastName: userCreationDtoMock.lastName,
        email: userCreationDtoMock.email,
        password: hashedPassword,
        phone: userCreationDtoMock.phone,
        documentType: userCreationDtoMock.documentType,
        documentNumber: userCreationDtoMock.documentNumber,
        role: { connect: { id: RoleIds.Employee } },
      };

      // Act
      await service.createUserAsync(userCreationDto);

      // Assert
      expect(userRepository.createUserAsync).toHaveBeenCalledWith(
        expect.objectContaining(expectedUser)
      );
    });

    it('should call hashAsync with the correct password', async () => {
      // Arrange
      const userCreationDto = { ...userCreationDtoMock };

      // Act
      await service.createUserAsync(userCreationDto);

      // Assert
      expect(encryptionService.hashAsync).toHaveBeenCalledWith(
        userCreationDto.password,
      );
    });
  });

  describe('findByEmailAsync', () => {
    it('should call findByEmailAsync with user email', async () => {
      // Arrange
      jest
        .spyOn(userRepository, 'findByEmailAsync')
        .mockResolvedValueOnce(user);

      // Act
      await service.findByEmailAsync(user.email);

      // Assert
      expect(userRepository.findByEmailAsync).toHaveBeenCalledWith(user.email);
    });
  });

  describe('findByIdAsync', () => {
    it('should call findByIdAsync with user id', async () => {
      // Arrange
      jest.spyOn(userRepository, 'findByIdAsync').mockResolvedValueOnce(user);

      // Act
      await service.findByIdAsync(user.id);

      // Assert
      expect(userRepository.findByIdAsync).toHaveBeenCalledWith(user.id);
    });
  });

  describe('incrementFailedLoginAttemptsAsync', () => {
    it('should call incrementFailedLoginAttemptsAsync with user id', async () => {
      // Arrange
      jest
        .spyOn(userRepository, 'incrementFailedLoginAttemptsAsync')
        .mockResolvedValue(user);

      // Act
      await service.incrementFailedLoginAttemptsAsync(user.id);

      // Assert
      expect(
        userRepository.incrementFailedLoginAttemptsAsync,
      ).toHaveBeenCalledWith(user.id);
    });
  });

  describe('updateAccountLockedUntilAsync', () => {
    it('should call updateAccountLockedUntilAsync with user id and locked until date', async () => {
      // Arrange
      const lockedUntil = new Date();

      // Act
      await service.updateAccountLockedUntilAsync(user.id, lockedUntil);

      // Assert
      expect(userRepository.updateAccountLockedUntilAsync).toHaveBeenCalledWith(
        user.id,
        lockedUntil,
      );
    });
  });

  describe('resetFailedLoginAttemptsAndLockedUntilAsync', () => {
    it('should call resetFailedLoginAttemptsAndLockedUntilAsync with user id', async () => {
      // Arrange
      jest
        .spyOn(userRepository, 'resetFailedLoginAttemptsAndLockedUntilAsync')
        .mockResolvedValueOnce(user);

      // Act
      await service.resetFailedLoginAttemptsAndLockedUntilAsync(user.id);

      // Assert
      expect(
        userRepository.resetFailedLoginAttemptsAndLockedUntilAsync,
      ).toHaveBeenCalledWith(user.id);
    });
  });

  describe('updateUserByIdAsync', () => {
    it('should call updateUserByIdAsync with user id and update data', async () => {
      // Arrange
      jest
        .spyOn(userRepository, 'updateUserByIdAsync')
        .mockResolvedValueOnce(user);

      // Act
      await service.updateUserByIdAsync(user.id, userMock);

      // Assert
      expect(userRepository.updateUserByIdAsync).toHaveBeenCalledWith(
        user.id,
        userMock,
      );
    });
  });

  describe('createClientUserWithRegistrationRequestAsync', () => {
    it('should execute the method within a transaction using unitOfWork.execute', async () => {
      // Arrange
      (unitOfWork.prisma.town.findUnique as unknown as jest.Mock).mockResolvedValue({ id: 1 });
      jest.spyOn(userRepository, 'createUserAsync').mockResolvedValue(user);
      jest.spyOn(clientRepository, 'createClientAsync').mockResolvedValueOnce({
        id: 1,
        companyName: userCreationDtoMock.companyName,
        taxCategoryId: 1,
        taxCategory: {
          id: 1,
          name: 'Responsable Inscripto',
          description: 'Test description',
        },
        userId: 1,
      });

      const executeSpy = jest
        .spyOn(unitOfWork, 'execute')
        .mockImplementation(async (cb) => {
          const tx = {} as Prisma.TransactionClient;
          return cb(tx);
        });

      // Act
      jest.spyOn(userRepository, 'createUserAsync').mockResolvedValue(user);
      jest.spyOn(userRepository, 'updateUserByIdAsync').mockResolvedValue(user);
      await service.createUserWithRegistrationRequestAsync(userCreationDtoMock);
      // Act
      await service.createClientUserWithRegistrationRequestAsync(
        userCreationDtoMock,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalled();
    });

    it('should call userRepository.createUserAsync with correct data', async () => {
      // Arrange
      const { companyName, taxCategoryId, ...userData } = userCreationDtoMock;
      const hashedPassword = 'hashedPassword';
      jest
        .spyOn(encryptionService, 'hashAsync')
        .mockResolvedValueOnce(hashedPassword);
      const txMock = {} as Prisma.TransactionClient;

      jest.spyOn(userRepository, 'createUserAsync').mockResolvedValueOnce(user);

      jest.spyOn(clientRepository, 'createClientAsync').mockResolvedValueOnce({
        id: 1,
        companyName: companyName,
        taxCategoryId: taxCategoryId,
        taxCategory: {
          id: 1,
          name: 'Responsable Inscripto',
          description: 'Test description',
        },
        userId: 1,
      });

      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      jest.spyOn(userRepository, 'updateUserByIdAsync').mockResolvedValue(user);

      const expectedUser = {
        ...userData,
        password: hashedPassword,
        phone: userCreationDtoMock.phone,
        documentType: userCreationDtoMock.documentType,
        documentNumber: userCreationDtoMock.documentNumber,
        role: { connect: { id: RoleIds.Employee } },
      };

      const createUserSpy = jest.spyOn(userRepository, 'createUserAsync');

      // Act
      await service.createClientUserWithRegistrationRequestAsync(
        userCreationDtoMock,
      );

      // Assert
      expect(createUserSpy).toHaveBeenCalledWith(expectedUser, txMock);
    });

    it('should call registrationRequestRepository.createRegistrationRequestAsync with correct data', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword';
      jest
        .spyOn(encryptionService, 'hashAsync')
        .mockResolvedValueOnce(hashedPassword);
      const txMock = {} as Prisma.TransactionClient;

      jest.spyOn(clientRepository, 'createClientAsync').mockResolvedValueOnce({
        id: 1,
        companyName: userCreationDtoMock.companyName,
        taxCategoryId: 1,
        taxCategory: {
          id: 1,
          name: 'Responsable Inscripto',
          description: 'Test description',
        },
        userId: 1,
      });

      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      jest.spyOn(userRepository, 'createUserAsync').mockResolvedValueOnce(user);
      jest.spyOn(userRepository, 'updateUserByIdAsync').mockResolvedValueOnce(user);

      const createRequestSpy = jest.spyOn(
        registrationRequestRepository,
        'createRegistrationRequestAsync',
      );

      // Act
      await service.createClientUserWithRegistrationRequestAsync(
        userCreationDtoMock,
      );

      // Assert
      expect(createRequestSpy).toHaveBeenCalledWith(
        {
          user: { connect: { id: user.id } },
          status: { connect: { id: RegistrationRequestStatusId.Pending } },
        },
        txMock,
      );
    });

    it('should call clientRepository.createClientAsync with correct data', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword';
      jest
        .spyOn(encryptionService, 'hashAsync')
        .mockResolvedValueOnce(hashedPassword);
      const txMock = {} as Prisma.TransactionClient;

      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      jest.spyOn(userRepository, 'createUserAsync').mockResolvedValueOnce(user);

      const expectedClient = {
        user: { connect: { id: user.id } },
        companyName: userCreationDtoMock.companyName,
        taxCategory: { connect: { id: userCreationDtoMock.taxCategoryId } },
      };

      const createClientSpy = jest
        .spyOn(clientRepository, 'createClientAsync')
        .mockResolvedValueOnce({
          id: 1,
          companyName: userCreationDtoMock.companyName,
          taxCategoryId: 1,
          taxCategory: {
            id: 1,
            name: 'Responsable Inscripto',
            description: 'Test description',
          },
          userId: 1,
        });

      // Act
      await service.createClientUserWithRegistrationRequestAsync(
        userCreationDtoMock,
      );

      // Assert
      expect(createClientSpy).toHaveBeenCalledWith(expectedClient, txMock);
    });

    it('should throw BadRequestException if email already exists', async () => {
      // Arrange
      jest
        .spyOn(userRepository, 'checkIfExistsByEmailAsync')
        .mockResolvedValueOnce(true);

      // Act & Assert
      await expect(
        service.createClientUserWithRegistrationRequestAsync(
          userCreationDtoMock,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  it('should create an address with correct data and associate it to the user', async () => {
    // Arrange
    (unitOfWork.prisma.town.findUnique as unknown as jest.Mock).mockResolvedValue({ id: 1 });
    const hashedPassword = 'hashedPassword123';
    jest.spyOn(encryptionService, 'hashAsync').mockResolvedValueOnce(hashedPassword);
    const txMock = {} as Prisma.TransactionClient;
    jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => cb(txMock));
    jest.spyOn(userRepository, 'createUserAsync').mockResolvedValueOnce(user);
    jest.spyOn(userRepository, 'updateUserByIdAsync').mockResolvedValueOnce(user);

    const addressCreateSpy = jest.spyOn(unitOfWork.prisma.address, 'create');

    // Act
    await service.createUserWithRegistrationRequestAsync(userCreationDtoMock);

    // Assert
    expect(addressCreateSpy).toHaveBeenCalledWith({
      data: {
        street: userCreationDtoMock.street,
        streetNumber: userCreationDtoMock.streetNumber,
        townId: userCreationDtoMock.townId,
        userId: user.id,
      },
    });
  });
});