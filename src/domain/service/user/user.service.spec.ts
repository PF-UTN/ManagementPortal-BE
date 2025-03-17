import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '@mp/repository';
import { UserService } from '../user/user.service';
import { User } from '../../entity/user.entity';
import { UserCreationDto } from '@mp/common/dtos';
import * as bcrypt from 'bcrypt';

const mockUserRepository = {
  createUserAsync: jest.fn(),
  findByEmailAsync: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;
  const saltOrRounds = 10;

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
      jest
        .spyOn(service, 'hashPasswordAsync')
        .mockResolvedValue(hashedPassword);

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

  describe('hashPasswordAsync', () => {
    it('should hash the password correctly', async () => {
      // Arrange
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, saltOrRounds);

      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(jest.fn(() => Promise.resolve(hashedPassword)));

      // Act
      const result = await service.hashPasswordAsync(password);

      // Assert
      expect(result).toBe(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, saltOrRounds);
    });
  });
});
