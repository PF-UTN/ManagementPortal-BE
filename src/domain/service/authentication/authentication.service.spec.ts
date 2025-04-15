import { EncryptionService, MailingService } from '@mp/common/services';
import {
  EncryptionServiceMock,
  JwtServiceMock,
  MailingServiceMock,
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
  let mailingServiceMock: MailingServiceMock;
  const MAX_LOGIN_ATTEMPTS = process.env.MAX_LOGIN_ATTEMPTS ?? 3;

  beforeEach(async () => {
    userServiceMock = new UserServiceMock();
    jwtServiceMock = new JwtServiceMock();
    encryptionServiceMock = new EncryptionServiceMock();
    mailingServiceMock = new MailingServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        { provide: UserService, useValue: userServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: EncryptionService, useValue: encryptionServiceMock },
        { provide: MailingService, useValue: mailingServiceMock },
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

    it('should throw UnauthorizedException if password is incorrect and return remaining attempts', async () => {
      // Arrange
      const mockedUser = {
        email: 'test@test.com',
        password: 'hashedPassword',
        id: 1,
        role: { rolePermissions: [] },
      };
      userServiceMock.findByEmailAsync.mockResolvedValueOnce(mockedUser);
      encryptionServiceMock.compareAsync.mockResolvedValueOnce(false);
      userServiceMock.incrementFailedLoginAttemptsAsync.mockResolvedValueOnce(
        2,
      );

      // Act
      const action = service.signInAsync('test@test.com', 'wrongPassword');

      // Assert
      await expect(action).rejects.toThrow(UnauthorizedException);
    });

    it('should return a JWT token if credentials are correct', async () => {
      // Arrange
      const mockedUser = {
        email: 'test@test.com',
        password: 'hashedPassword',
        id: 1,
        role: {
          rolePermissions: [],
        },
      };

      userServiceMock.findByEmailAsync.mockResolvedValueOnce(mockedUser);
      jwtServiceMock.signAsync.mockResolvedValueOnce('mockJwtToken');
      encryptionServiceMock.compareAsync.mockResolvedValueOnce(true);

      // Act
      const result = await service.signInAsync('test@test.com', 'password');

      // Assert
      expect(result).toEqual({ access_token: 'mockJwtToken' });
    });

    it('should call compareAsync with correct arguments', async () => {
      // Arrange
      const mockedUser = {
        email: 'test@test.com',
        password: 'hashedPassword',
        id: 1,
        role: {
          rolePermissions: [],
        },
      };

      userServiceMock.findByEmailAsync.mockResolvedValueOnce(mockedUser);
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
      const mockedUser = {
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

      userServiceMock.findByEmailAsync.mockResolvedValueOnce(mockedUser);
      jwtServiceMock.signAsync.mockResolvedValueOnce('mockJwtToken');
      encryptionServiceMock.compareAsync.mockResolvedValueOnce(true);

      const expectedPermissions = mockedUser.role.rolePermissions.map(
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

    it('should throw UnauthorizedException if account is currently locked', async () => {
      // Arrange
      const futureDate = new Date(Date.now() + 60 * 60 * 1000);
      const mockedUser = {
        email: 'test@test.com',
        password: 'hashedPassword',
        id: 1,
        accountLockedUntil: futureDate,
        role: { rolePermissions: [] },
      };
      userServiceMock.findByEmailAsync.mockResolvedValueOnce(mockedUser);

      // Act
      const action = service.signInAsync('test@test.com', 'password');

      // Assert
      await expect(action).rejects.toThrow(UnauthorizedException);
    });

    it('should reset login attempts if lock expired', async () => {
      // Arrange
      const pastDate = new Date(Date.now() - 60 * 60 * 1000);
      const mockedUser = {
        email: 'test@test.com',
        password: 'hashedPassword',
        id: 1,
        accountLockedUntil: pastDate,
        role: { rolePermissions: [] },
      };
      userServiceMock.findByEmailAsync.mockResolvedValueOnce(mockedUser);
      encryptionServiceMock.compareAsync.mockResolvedValueOnce(true);
      jwtServiceMock.signAsync.mockResolvedValueOnce('mockJwtToken');

      // Act
      await service.signInAsync('test@test.com', 'password');

      // Assert
      expect(
        userServiceMock.resetFailedLoginAttemptsAndLockedUntilAsync,
      ).toHaveBeenCalledWith(mockedUser.id);
    });

    it('should lock account after max failed attempts', async () => {
      // Arrange
      const mockedUser = {
        email: 'test@test.com',
        password: 'hashedPassword',
        id: 1,
        role: { rolePermissions: [] },
      };
      userServiceMock.findByEmailAsync.mockResolvedValueOnce(mockedUser);
      encryptionServiceMock.compareAsync.mockResolvedValueOnce(false);
      userServiceMock.incrementFailedLoginAttemptsAsync.mockResolvedValueOnce(
        MAX_LOGIN_ATTEMPTS,
      );

      // Act & Assert
      await expect(
        service.signInAsync('test@test.com', 'wrongPassword'),
      ).rejects.toThrow(UnauthorizedException);
      expect(userServiceMock.updateAccountLockedUntilAsync).toHaveBeenCalled();
    });

    it('should return remaining attempts when credentials are incorrect', async () => {
      // Arrange
      const mockedUser = {
        email: 'test@test.com',
        password: 'hashedPassword',
        id: 1,
        role: { rolePermissions: [] },
      };
      userServiceMock.findByEmailAsync.mockResolvedValueOnce(mockedUser);
      encryptionServiceMock.compareAsync.mockResolvedValueOnce(false);
      userServiceMock.incrementFailedLoginAttemptsAsync.mockResolvedValueOnce(
        1,
      );

      // Act
      const action = service.signInAsync('test@test.com', 'wrongPassword');

      // Assert
      await expect(action).rejects.toThrow(UnauthorizedException);
    });
  });
});
