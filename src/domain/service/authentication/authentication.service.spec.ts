import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { EncryptionService } from '@mp/common/services';
import { AuthenticationService } from './authentication.service';
import { UserService } from '../user/user.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  const mockUserService = {
    findByEmailAsync: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockEncryptionService = {
    compareAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EncryptionService, useValue: mockEncryptionService },
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

    mockUserService.findByEmailAsync.mockResolvedValueOnce(mockUser);
    mockJwtService.signAsync.mockResolvedValueOnce('mockJwtToken');
    mockEncryptionService.compareAsync.mockResolvedValueOnce(true);

    // Act
    const result = await service.signInAsync('test@test.com', 'password');

    // Assert
    expect(result).toEqual({ access_token: 'mockJwtToken' });
  });

  it('should call compareAsync with correct arguments', async () => {
    // Arrange
    const mockUser = {
      email: 'test@test.com',
      password: 'hashedPassword',
      id: 1,
    };

    mockUserService.findByEmailAsync.mockResolvedValueOnce(mockUser);
    mockEncryptionService.compareAsync.mockResolvedValueOnce(true);

    // Act
    await service.signInAsync('test@test.com', 'password');

    // Assert
    expect(mockEncryptionService.compareAsync).toHaveBeenCalledWith(
      'password',
      'hashedPassword',
    );
  });

  it('should call signAsync with correct payload', async () => {
    // Arrange
    const mockUser = {
      email: 'test@test.com',
      password: 'hashedPassword',
      id: 1,
      role: {
        rolePermissions: [
          { permission: { name: 'permission1' } },
          { permission: { name: 'permission2' } },
        ],
      },
    };

    mockUserService.findByEmailAsync.mockResolvedValueOnce(mockUser);
    mockJwtService.signAsync.mockResolvedValueOnce('mockJwtToken');
    mockEncryptionService.compareAsync.mockResolvedValueOnce(true);

    const expectedPermissions = mockUser.role.rolePermissions.map(
      (rolePermission) => rolePermission.permission.name,
    );

    // Act
    await service.signInAsync('test@test.com', 'password');

    // Assert
    expect(mockJwtService.signAsync).toHaveBeenCalledWith({
      email: 'test@test.com',
      sub: 1,
      permissions: expectedPermissions,
    });
  });
});
