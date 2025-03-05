import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '@mp/repository';
import { UserService } from '../user/user.service';
import { User } from '../../entity/user.entity';
import { UserCreationDto } from '@mp/common/dtos';

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
    it('should call createUserAsync', async () => {
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
      expect(mockUserRepository.createUserAsync).toHaveBeenCalledWith(
        new User(userCreationDto),
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
});
