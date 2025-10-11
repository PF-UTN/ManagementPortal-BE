import { Test, TestingModule } from '@nestjs/testing';

import { RoleIds } from '@mp/common/constants';
import { PrismaServiceMock, userMock } from '@mp/common/testing';

import { UserRepository } from './user.repository';
import { PrismaService } from '../prisma.service';

describe('UserRepository', () => {
  let repository: UserRepository;
  let prismaServiceMock: PrismaServiceMock;

  beforeEach(async () => {
    prismaServiceMock = new PrismaServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createUserAsync', () => {
    it('should create a new user', async () => {
      // Arrange
      const newUser = { ...userMock, role: { connect: { id: 1 } } };
      prismaServiceMock.user.create.mockResolvedValue(newUser);

      // Act
      const result = await repository.createUserAsync(newUser);

      // Assert
      expect(result).toEqual(newUser);
    });
  });

  describe('findByIdAsync', () => {
    it('should find a user by ID', async () => {
      // Arrange
      const userId = 1;
      prismaServiceMock.user.findUnique.mockResolvedValue(userMock);

      // Act
      const result = await repository.findByIdAsync(userId);

      // Assert
      expect(result).toEqual(userMock);
    });

    it('should return null if user not found', async () => {
      // Arrange
      const userId = 999;
      prismaServiceMock.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findByIdAsync(userId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByEmailAsync', () => {
    it('should find a user by email', async () => {
      // Arrange
      prismaServiceMock.user.findUnique.mockResolvedValue(userMock);

      // Act
      const result = await repository.findByEmailAsync(userMock.email);

      // Assert
      expect(result).toEqual(userMock);
    });

    it('should return null if user not found', async () => {
      // Arrange
      prismaServiceMock.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findByEmailAsync(userMock.email);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateUserByIdAsync', () => {
    it('should update a user by ID', async () => {
      // Arrange
      const updatedUser = { ...userMock, firstName: 'Updated Name' };
      prismaServiceMock.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await repository.updateUserByIdAsync(userMock.id, {
        firstName: 'Updated Name',
      });

      // Assert
      expect(result).toEqual(updatedUser);
    });
  });

  describe('incrementFailedLoginAttemptsAsync', () => {
    it('should increment failed login attempts', async () => {
      // Arrange
      const userId = 1;
      const updatedUser = { ...userMock, failedLoginAttempts: 1 };
      prismaServiceMock.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await repository.incrementFailedLoginAttemptsAsync(userId);

      // Assert
      expect(result).toEqual(updatedUser);
    });
  });

  describe('updateAccountLockedUntilAsync', () => {
    it('should update account locked until date', async () => {
      // Arrange
      const userId = 1;
      const lockedUntil = new Date(Date.now() + 3600 * 1000);
      const updatedUser = { ...userMock, accountLockedUntil: lockedUntil };
      prismaServiceMock.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await repository.updateAccountLockedUntilAsync(
        userId,
        lockedUntil,
      );

      // Assert
      expect(result).toEqual(updatedUser);
    });
  });

  describe('resetFailedLoginAttemptsAndLockedUntilAsync', () => {
    it('should reset failed login attempts and locked until date', async () => {
      // Arrange
      const userId = 1;
      const updatedUser = {
        ...userMock,
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      };
      prismaServiceMock.user.update.mockResolvedValue(updatedUser);

      // Act
      const result =
        await repository.resetFailedLoginAttemptsAndLockedUntilAsync(userId);

      // Assert
      expect(result).toEqual(updatedUser);
    });
  });

  describe('checkIfExistsByEmailAsync', () => {
    it('should return true if user exists with given email', async () => {
      // Arrange
      prismaServiceMock.user.findUnique.mockResolvedValue(userMock);

      // Act
      const result = await repository.checkIfExistsByEmailAsync(userMock.email);

      // Assert
      expect(result).toBe(true);
      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: userMock.email },
      });
    });

    it('should return false if user does not exist with given email', async () => {
      // Arrange
      prismaServiceMock.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.checkIfExistsByEmailAsync(
        'nonexistent@email.com',
      );

      // Assert
      expect(result).toBe(false);
      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@email.com' },
      });
    });
  });

  describe('findAdminsAsync', () => {
    it('should call prisma.findMany with correct parameters', async () => {
      // Act
      await repository.findAdminsAsync();

      // Assert
      expect(prismaServiceMock.user.findMany).toHaveBeenCalledWith({
        where: { roleId: RoleIds.Admin },
      });
    });
  });
});
