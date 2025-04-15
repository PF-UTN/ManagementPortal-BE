import { RoleIds } from '@mp/common/constants';
import { EncryptionService } from '@mp/common/services';
import {
  UserRepositoryMock,
  userCreationDtoMock,
  userMock,
  EncryptionServiceMock,
} from '@mp/common/testing';
import { UserRepository } from '@mp/repository';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, User } from '@prisma/client';

import { UserService } from '../user/user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepositoryMock: UserRepositoryMock;
  let encryptionServiceMock: EncryptionServiceMock;

  beforeEach(async () => {
    userRepositoryMock = new UserRepositoryMock();
    encryptionServiceMock = new EncryptionServiceMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: userRepositoryMock },
        { provide: EncryptionService, useValue: encryptionServiceMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUserAsync', () => {
    it('should call createUserAsync with a hashed password', async () => {
      // Arrange
      const userCreationDto = { ...userCreationDtoMock };
      const hashedPassword = 'hashedPassword123';
      encryptionServiceMock.hashAsync.mockResolvedValue(hashedPassword);

      const expectedUser = {
        ...userCreationDtoMock,
        password: hashedPassword,
        role: { connect: { id: RoleIds.Employee } },
      } as Prisma.UserCreateInput;

      // Act
      await service.createUserAsync(userCreationDto);

      // Assert
      expect(userRepositoryMock.createUserAsync).toHaveBeenCalledWith(
        expectedUser,
      );
    });

    it('should call hashAsync with the correct password', async () => {
      // Arrange
      const userCreationDto = { ...userCreationDtoMock };

      // Act
      await service.createUserAsync(userCreationDto);

      // Assert
      expect(encryptionServiceMock.hashAsync).toHaveBeenCalledWith(
        userCreationDto.password,
      );
    });
  });

  describe('findByEmailAsync', () => {
    it('should call findByEmailAsync with user email', async () => {
      // Arrange
      const user = { ...userMock, roleId: 1 } as User;
      userRepositoryMock.findByEmailAsync.mockResolvedValue(user);

      // Act
      await service.findByEmailAsync(userMock.email);

      // Assert
      expect(userRepositoryMock.findByEmailAsync).toHaveBeenCalledWith(
        'john.doe@example.com',
      );
    });
  });
  describe('findByIdAsync', () => {
    it('should call findByIdAsync with user id', async () => {
      // Arrange
      const user = { ...userMock, roleId: 1 } as User;
      userRepositoryMock.findByIdAsync.mockResolvedValue(user);

      // Act
      await service.findByIdAsync(userMock.id);

      // Assert
      expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(
        userMock.id,
      );
    });
  });

  describe('incrementFailedLoginAttemptsAsync', () => {
    it('should call incrementFailedLoginAttemptsAsync with user id', async () => {
      // Arrange
      const user = { ...userMock, roleId: 1 } as User;
      userRepositoryMock.incrementFailedLoginAttemptsAsync.mockResolvedValue(
        user,
      );

      // Act
      await service.incrementFailedLoginAttemptsAsync(userMock.id);

      // Assert
      expect(
        userRepositoryMock.incrementFailedLoginAttemptsAsync,
      ).toHaveBeenCalledWith(userMock.id);
    });
  });

  describe('updateAccountLockedUntilAsync', () => {
    it('should call updateAccountLockedUntilAsync with user id and locked until date', async () => {
      // Arrange
      const lockedUntil = new Date();

      // Act
      await service.updateAccountLockedUntilAsync(userMock.id, lockedUntil);

      // Assert
      expect(
        userRepositoryMock.updateAccountLockedUntilAsync,
      ).toHaveBeenCalledWith(userMock.id, lockedUntil);
    });
  });

  describe('resetFailedLoginAttemptsAndLockedUntilAsync', () => {
    it('should call resetFailedLoginAttemptsAndLockedUntilAsync with user id', async () => {
      // Arrange
      const user = { ...userMock, roleId: 1 } as User;
      userRepositoryMock.resetFailedLoginAttemptsAndLockedUntilAsync.mockResolvedValue(
        user,
      );

      // Act
      await service.resetFailedLoginAttemptsAndLockedUntilAsync(userMock.id);

      // Assert
      expect(
        userRepositoryMock.resetFailedLoginAttemptsAndLockedUntilAsync,
      ).toHaveBeenCalledWith(userMock.id);
    });
  });
});
