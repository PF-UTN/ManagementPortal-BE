import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { RegistrationRequestStatusId, RoleIds } from '@mp/common/constants';
import { UserCreationResponse } from '@mp/common/dtos';
import { EncryptionService } from '@mp/common/services';
import { addressMock, userCreationDtoMock, userMock } from '@mp/common/testing';
import {
  AddressRepository,
  ClientRepository,
  PrismaUnitOfWork,
  RegistrationRequestRepository,
  UserRepository,
} from '@mp/repository';

import { TownService } from '../town/town.service';
import { UserService } from '../user/user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;
  let encryptionService: EncryptionService;
  let registrationRequestRepository: RegistrationRequestRepository;
  let clientRepository: ClientRepository;
  let addressRepository: AddressRepository;
  let townService: TownService;
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
        {
          provide: AddressRepository,
          useValue: mockDeep(AddressRepository),
        },
        {
          provide: TownService,
          useValue: mockDeep(TownService),
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
    addressRepository = module.get<AddressRepository>(AddressRepository);
    townService = module.get<TownService>(TownService);
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
      jest.spyOn(townService, 'existsAsync').mockResolvedValue(true);
      jest.spyOn(userRepository, 'createUserAsync').mockResolvedValue(user);
      jest.spyOn(addressRepository, 'createAddressAsync').mockResolvedValue({
        id: 1,
        ...addressMock,
      });
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
        addressId: 1,
      });

      const executeSpy = jest
        .spyOn(unitOfWork, 'execute')
        .mockImplementation(async (cb) => {
          const tx = {} as Prisma.TransactionClient;
          return cb(tx);
        });

      // Act
      await service.createClientUserWithRegistrationRequestAsync(
        userCreationDtoMock,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalled();
    });

    it('should call userRepository.createUserAsync with correct data', async () => {
      // Arrange
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { companyName, taxCategoryId, address, ...userData } =
        userCreationDtoMock;
      const hashedPassword = 'hashedPassword';
      jest
        .spyOn(encryptionService, 'hashAsync')
        .mockResolvedValueOnce(hashedPassword);
      const txMock = {} as Prisma.TransactionClient;

      jest.spyOn(townService, 'existsAsync').mockResolvedValue(true);
      jest.spyOn(userRepository, 'createUserAsync').mockResolvedValueOnce(user);
      jest
        .spyOn(addressRepository, 'createAddressAsync')
        .mockResolvedValueOnce({
          id: 1,
          ...addressMock,
        });
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
        addressId: 1,
      });

      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      const expectedUser = {
        ...userData,
        password: hashedPassword,
        role: { connect: { id: RoleIds.Client } },
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

      jest.spyOn(townService, 'existsAsync').mockResolvedValue(true);
      jest.spyOn(userRepository, 'createUserAsync').mockResolvedValueOnce(user);
      jest
        .spyOn(addressRepository, 'createAddressAsync')
        .mockResolvedValueOnce({
          id: 1,
          ...addressMock,
        });

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
        addressId: 1,
      });

      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      jest.spyOn(userRepository, 'createUserAsync').mockResolvedValueOnce(user);

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

      jest.spyOn(townService, 'existsAsync').mockResolvedValue(true);
      jest.spyOn(userRepository, 'createUserAsync').mockResolvedValueOnce(user);
      jest
        .spyOn(addressRepository, 'createAddressAsync')
        .mockResolvedValueOnce({
          id: 1,
          ...addressMock,
        });

      const expectedClient = {
        userId: user.id,
        companyName: userCreationDtoMock.companyName,
        taxCategoryId: userCreationDtoMock.taxCategoryId,
        addressId: 1
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
          addressId: 1,
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

    it('should throw BadRequestException if town does not exist', async () => {
      // Arrange
      jest
        .spyOn(userRepository, 'checkIfExistsByEmailAsync')
        .mockResolvedValue(false);
      jest
        .spyOn(townService, 'existsAsync')
        .mockResolvedValue(false);

      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        const tx = {} as Prisma.TransactionClient;
        return cb(tx);
      });

      // Act & Assert
      await expect(
        service.createClientUserWithRegistrationRequestAsync(
          userCreationDtoMock,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  it('should call addressRepository.createAddressAsync with correct data', async () => {
    // Arrange
    const hashedPassword = 'hashedPassword';
    jest
      .spyOn(encryptionService, 'hashAsync')
      .mockResolvedValueOnce(hashedPassword);
    const txMock = {} as Prisma.TransactionClient;

    jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
      return cb(txMock);
    });

    jest.spyOn(townService, 'existsAsync').mockResolvedValue(true);
    jest.spyOn(userRepository, 'createUserAsync').mockResolvedValueOnce(user);

    const expectedAddress = { ...addressMock };

    const createAddressSpy = jest
      .spyOn(addressRepository, 'createAddressAsync')
      .mockResolvedValueOnce({
        id: 1,
        ...addressMock,
      });

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
      addressId: 1,
    });

    // Act
    await service.createClientUserWithRegistrationRequestAsync(
      userCreationDtoMock,
    );

    // Assert
    expect(createAddressSpy).toHaveBeenCalledWith(expectedAddress, txMock);
  });
});
