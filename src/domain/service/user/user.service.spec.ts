import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '@mp/repository';
import { UserCreationDto } from '@mp/common/dtos';
import { EncryptionService } from '@mp/common/services';
import { Prisma, User } from '@prisma/client';
import { UserService } from '../user/user.service';
import { RoleIds } from '@mp/common/constants';

const mockUserRepository = {
  createUserAsync: jest.fn(),
  findByEmailAsync: jest.fn(),
  findByIdAsync: jest.fn(),
};

const mockEncryptionService = {
  hashAsync: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: EncryptionService, useValue: mockEncryptionService },
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
      const userCreationDto: UserCreationDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890',
        documentNumber: '123456789',
        documentType: 'DNI',
      };

      const hashedPassword = 'hashedPassword123';
      mockEncryptionService.hashAsync.mockResolvedValue(hashedPassword);

      const expectedUser = {
        ...userCreationDto,
        password: hashedPassword,
        role: { connect: { id: RoleIds.Employee } },
      } as Prisma.UserCreateInput;

      // Act
      await service.createUserAsync(userCreationDto);

      // Assert
      expect(mockUserRepository.createUserAsync).toHaveBeenCalledWith(
        expectedUser,
      );
    });

    it('should call hashAsync with the correct password', async () => {
      // Arrange
      const userCreationDto: UserCreationDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890',
        documentNumber: '123456789',
        documentType: 'DNI',
      };

      // Act
      await service.createUserAsync(userCreationDto);

      // Assert
      expect(mockEncryptionService.hashAsync).toHaveBeenCalledWith(
        userCreationDto.password,
      );
    });
  });

  describe('findByEmailAsync', () => {
    it('should call findByEmailAsync with user email', async () => {
      // Arrange
      const mockUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890',
        documentNumber: '123456789',
        documentType: 'DNI',
        roleId: 1,
      } as User;
      mockUserRepository.findByEmailAsync.mockResolvedValue(mockUser);

      // Act
      await service.findByEmailAsync(mockUser.email);

      // Assert
      expect(mockUserRepository.findByEmailAsync).toHaveBeenCalledWith(
        mockUser.email,
      );
    });
  });
  describe('findByIdAsync', () => {
    it('should call findByIdAsync with user id', async () => {
      // Arrange
      const mockUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890',
        documentNumber: '123456789',
        documentType: 'DNI',
        roleId: 1,
      } as User;
      mockUserRepository.findByIdAsync.mockResolvedValue(mockUser);

      // Act
      await service.findByIdAsync(mockUser.id);

      // Assert
      expect(mockUserRepository.findByIdAsync).toHaveBeenCalledWith(
        mockUser.id,
      );
    });
  });
});
