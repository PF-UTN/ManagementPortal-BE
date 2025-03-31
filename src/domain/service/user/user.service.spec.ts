import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '@mp/repository';
import { EncryptionService } from '@mp/common/services';
import {
  UserRepositoryMock,
  mockUserCreationDto,
  mockUser,
  EncryptionServiceMock,
} from '@mp/common/testing';
import { UserService } from '../user/user.service';
import { User } from '../../entity/user.entity';

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: UserRepositoryMock;
  let mockEncryptionService: EncryptionServiceMock;

  beforeEach(async () => {
    mockUserRepository = new UserRepositoryMock();
    mockEncryptionService = new EncryptionServiceMock();
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
      const userCreationDto = { ...mockUserCreationDto };
      const hashedPassword = 'hashedPassword123';
      mockEncryptionService.hashAsync.mockResolvedValue(hashedPassword);

      const expectedUser = new User({
        ...mockUserCreationDto,
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
      const userCreationDto = { ...mockUserCreationDto };

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
      const user = { ...mockUser };
      mockUserRepository.findByEmailAsync.mockResolvedValue(user);

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
      const user = { ...mockUser };
      mockUserRepository.findByIdAsync.mockResolvedValue(user);

      // Act
      await service.findByIdAsync(1);

      // Assert
      expect(mockUserRepository.findByIdAsync).toHaveBeenCalledWith(1);
    });
  });
});
