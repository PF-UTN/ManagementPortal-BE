import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '@mp/repository';
import { UserCreationDto } from '@mp/common/dtos';
import { EncryptionService } from '@mp/common/services';
import { UserService } from '../user/user.service';
import { User } from '../../entity/user.entity';

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

      const expectedUser = new User({
        ...userCreationDto,
        password: hashedPassword,
      });

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
      const mockUser = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890',
        documentNumber: '123456789',
        documentType: 'DNI',
      });
      mockUserRepository.findByEmailAsync.mockResolvedValue(mockUser);

      // Act
      await service.findByEmailAsync('john.doe@example.com');

      // Assert
      expect(mockUserRepository.findByEmailAsync).toHaveBeenCalledWith(
        'john.doe@example.com',
      );
    });
  });
  describe('findByIdAsync', () => {
    it('should call findByIdAsync with user id', async () => {
      // Arrange
      const mockUser = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890',
        documentNumber: '123456789',
        documentType: 'DNI',
      });
      mockUserRepository.findByIdAsync.mockResolvedValue(mockUser);

      // Act
      await service.findByIdAsync(1);

      // Assert
      expect(mockUserRepository.findByIdAsync).toHaveBeenCalledWith(1);
    });
  });
});
