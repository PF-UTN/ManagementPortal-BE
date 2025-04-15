import { EncryptionService } from '@mp/common/services';
import {
  EncryptionServiceMock,
  JwtServiceMock,
  UserServiceMock,
} from '@mp/common/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticationService } from './authentication.service';
import { UserService } from '../user/user.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userServiceMock: UserServiceMock;
  let jwtServiceMock: JwtServiceMock;
  let encryptionServiceMock: EncryptionServiceMock;

  beforeEach(async () => {
    userServiceMock = new UserServiceMock();
    jwtServiceMock = new JwtServiceMock();
    encryptionServiceMock = new EncryptionServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        { provide: UserService, useValue: userServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: EncryptionService, useValue: encryptionServiceMock },
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
    expect(result).toEqual('mockJwtToken');
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
});
