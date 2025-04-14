import { EncryptionService } from '@mp/common/services';
import {
  ConfigServiceMock,
  EncryptionServiceMock,
  JwtServiceMock,
  userMock,
  UserServiceMock,
} from '@mp/common/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticationService } from './authentication.service';
import { UserService } from '../user/user.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userServiceMock: UserServiceMock;
  let jwtServiceMock: JwtServiceMock;
  let encryptionServiceMock: EncryptionServiceMock;
  let configServiceMock: ConfigServiceMock;

  beforeEach(async () => {
    userServiceMock = new UserServiceMock();
    jwtServiceMock = new JwtServiceMock();
    encryptionServiceMock = new EncryptionServiceMock();
    configServiceMock = new ConfigServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        { provide: UserService, useValue: userServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: EncryptionService, useValue: encryptionServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
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
      userServiceMock.findByEmailAsync.mockResolvedValueOnce(null);

      // Act
      const action = service.signInAsync('test@test.com', 'password');

      // Assert
      await expect(action).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      // Arrange
      const mockUser = { email: 'test@test.com', password: 'wrongPassword' };
      userServiceMock.findByEmailAsync.mockResolvedValueOnce(mockUser);

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
      role: {
        rolePermissions: [],
      },
    };

    userServiceMock.findByEmailAsync.mockResolvedValueOnce(mockUser);
    jwtServiceMock.signAsync.mockResolvedValueOnce('mockJwtToken');
    encryptionServiceMock.compareAsync.mockResolvedValueOnce(true);

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
      role: {
        rolePermissions: [],
      },
    };

    userServiceMock.findByEmailAsync.mockResolvedValueOnce(mockUser);
    encryptionServiceMock.compareAsync.mockResolvedValueOnce(true);

    // Act
    await service.signInAsync('test@test.com', 'password');

    // Assert
    expect(encryptionServiceMock.compareAsync).toHaveBeenCalledWith(
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

    userServiceMock.findByEmailAsync.mockResolvedValueOnce(mockUser);
    jwtServiceMock.signAsync.mockResolvedValueOnce('mockJwtToken');
    encryptionServiceMock.compareAsync.mockResolvedValueOnce(true);

    const expectedPermissions = mockUser.role.rolePermissions.map(
      (rolePermission) => rolePermission.permission.name,
    );

    // Act
    await service.signInAsync('test@test.com', 'password');

    // Assert
    expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
      email: 'test@test.com',
      sub: 1,
      permissions: expectedPermissions,
    });
  });

  describe('requestPasswordResetAsync', () => {
    it('should return a JWT token when user is found', async () => {
      // Arrange
      const user = { ...userMock, id: 1 };
      const expectedToken = 'mocked-jwt';

      userServiceMock.findByEmailAsync.mockResolvedValue(user);
      jwtServiceMock.signAsync.mockResolvedValue(expectedToken);

      // Act
      const result = await service.requestPasswordResetAsync(user.email);

      // Assert
      expect(result).toBe(expectedToken);
    });

    it('should return undefined when user is not found', async () => {
      // Arrange
      userServiceMock.findByEmailAsync.mockResolvedValue(null);

      // Act
      const result = await service.requestPasswordResetAsync(
        'nonexistent@test.com',
      );

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('resetPasswordAsync', () => {
    it('should update the user if token and user are valid', async () => {
      // Arrange
      const token = 'valid-token';
      const password = 'new-password';
      const payload = { sub: 1, email: 'test@test.com' };
      const user = { id: 1, email: payload.email };

      jwtServiceMock.verifyAsync.mockResolvedValue(payload);
      userServiceMock.findByIdAsync.mockResolvedValue(user);
      encryptionServiceMock.hashAsync.mockResolvedValue('hashed-password');

      // Act
      await service.resetPasswordAsync(token, password);

      // Assert
      expect(userServiceMock.updateUserByIdAsync).toHaveBeenCalledWith(
        user.id,
        {
          ...user,
          password: 'hashed-password',
        },
      );
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      // Arrange
      jwtServiceMock.verifyAsync.mockResolvedValue(null);
      
      // Act & Assert
      await expect(
        service.resetPasswordAsync('invalid-token', 'pass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      // Arrange
      jwtServiceMock.verifyAsync.mockResolvedValue({ sub: 99 });
      userServiceMock.findByIdAsync.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.resetPasswordAsync('valid-token', 'pass'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
