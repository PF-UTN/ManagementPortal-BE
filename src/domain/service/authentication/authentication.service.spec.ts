import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  const mockUserService = {
    findByEmailAsync: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signInAsync', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      mockUserService.findByEmailAsync.mockResolvedValueOnce(null);

      // Act
      const action = service.signInAsync('test@test.com', 'password');

      // Assert
      await expect(action).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      // Arrange
      const mockUser = { email: 'test@test.com', password: 'wrongPassword' };
      mockUserService.findByEmailAsync.mockResolvedValueOnce(mockUser);

      // Act
      const action = service.signInAsync('test@test.com', 'password');

      // Assert
      await expect(action).rejects.toThrow(UnauthorizedException);
    });
  });

  it('should return a JWT token if credentials are correct', async () => {
    // Arrange
    const mockUser = {
      email: 'test@test.com',
      password: 'hashedPassword',
      id: 1,
    };

    jest
      .spyOn(bcrypt, 'compare')
      .mockImplementation(jest.fn(() => Promise.resolve(true)));

    mockUserService.findByEmailAsync.mockResolvedValueOnce(mockUser);
    mockJwtService.signAsync.mockResolvedValueOnce('mockJwtToken');

    // Act
    const result = await service.signInAsync('test@test.com', 'password');

    // Assert
    expect(result).toEqual({ access_token: 'mockJwtToken' });
    expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    expect(mockJwtService.signAsync).toHaveBeenCalledWith({
      email: 'test@test.com',
      sub: 1,
    });
  });
});
