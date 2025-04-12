import { PrismaServiceMock, userMock } from '@mp/common/testing';
import { Test, TestingModule } from '@nestjs/testing';

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
});
