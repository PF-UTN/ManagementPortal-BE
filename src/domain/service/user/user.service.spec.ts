import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '@mp/repository';
import { UserService } from '../user/user.service';
import { User } from '../../entity/user.entity';
import { UserCreationDto } from '../../../controllers/authentication/dto/user-creation.dto';

const mockUserRepository = {
  createUserAsync: jest.fn(),
  findByEmailAsync: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUserAsync', () => {
    it('should create a user', async () => {
      // Arrange
      const userCreationDto: UserCreationDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890',
      };
      const createdUser = new User(
        userCreationDto.firstName,
        userCreationDto.lastName,
        userCreationDto.email,
        userCreationDto.password,
        userCreationDto.phone,
      );
      mockUserRepository.createUserAsync.mockResolvedValue(createdUser);

      // Act
      const result = await service.createUserAsync(userCreationDto);

      // Assert
      expect(result).toEqual(createdUser);
      expect(mockUserRepository.createUserAsync).toHaveBeenCalledWith(
        expect.any(User),
      );
    });
  });

  describe('findByEmailAsync', () => {
    it('should return a user when email exists', async () => {
      // Arrange
      const mockUser = new User(
        'John',
        'Doe',
        'john.doe@example.com',
        'password123',
        '1234567890',
      );
      mockUserRepository.findByEmailAsync.mockResolvedValue(mockUser);

      // Act
      const result = await service.findByEmailAsync('john.doe@example.com');

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByEmailAsync).toHaveBeenCalledWith(
        'john.doe@example.com',
      );
    });

    it('should return null if user not found', async () => {
      // Arrange
      mockUserRepository.findByEmailAsync.mockResolvedValue(null);

      // Act
      const result = await service.findByEmailAsync('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
      expect(mockUserRepository.findByEmailAsync).toHaveBeenCalledWith(
        'nonexistent@example.com',
      );
    });
  });
});
