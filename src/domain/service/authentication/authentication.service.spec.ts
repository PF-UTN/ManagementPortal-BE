import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Permission, Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { RegistrationRequestStatusId } from '@mp/common/constants';
import { EncryptionService, MailingService } from '@mp/common/services';

import { AuthenticationService } from './authentication.service';
import { UserService } from '../user/user.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userService: jest.Mocked<UserService>;
  let jwtService: JwtService;
  let encryptionService: EncryptionService;
  let mailingService: MailingService;
  let configService: ConfigService;
  let user: ReturnType<
    typeof mockDeep<
      Prisma.UserGetPayload<{
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true;
                };
              };
            };
          };
          registrationRequest: true;
        };
      }>
    >
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        { provide: UserService, useValue: mockDeep(UserService) },
        { provide: JwtService, useValue: mockDeep(JwtService) },
        { provide: EncryptionService, useValue: mockDeep(EncryptionService) },
        { provide: MailingService, useValue: mockDeep(MailingService) },
        { provide: ConfigService, useValue: mockDeep(ConfigService) },
      ],
    }).compile();

    userService = module.get(UserService);
    jwtService = module.get<JwtService>(JwtService);
    encryptionService = module.get<EncryptionService>(EncryptionService);
    mailingService = module.get<MailingService>(MailingService);
    configService = module.get<ConfigService>(ConfigService);

    service = module.get<AuthenticationService>(AuthenticationService);

    user = mockDeep<
      Prisma.UserGetPayload<{
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true;
                };
              };
            };
          };
          registrationRequest: true;
        };
      }>
    >();

    user.email = 'test@test.com';
    user.password = 'hashedPassword';
    user.id = 1;
    user.role.rolePermissions = [];
    user.registrationRequest = {
      id: 1,
      statusId: RegistrationRequestStatusId.Approved,
      userId: 1,
      requestDate: mockDeep<Date>(new Date()),
      note: null,
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signInAsync', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      jest.spyOn(userService, 'findByEmailAsync').mockResolvedValueOnce(null);

      // Act
      const action = service.signInAsync('test@test.com', 'password');

      // Assert
      await expect(action).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect and return remaining attempts', async () => {
      // Arrange
      user.password = 'wrongPassword';
      jest.spyOn(userService, 'findByEmailAsync').mockResolvedValueOnce(user);

      // Act
      const action = service.signInAsync('test@test.com', 'wrongPassword');

      // Assert
      await expect(action).rejects.toThrow(UnauthorizedException);
    });

    it('should return a JWT token if credentials are correct', async () => {
      // Arrange
      user.password = 'hashedPassword';
      jest.spyOn(userService, 'findByEmailAsync').mockResolvedValueOnce(user);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce('mockJwtToken');
      jest.spyOn(encryptionService, 'compareAsync').mockResolvedValueOnce(true);

      // Act
      const result = await service.signInAsync('test@test.com', 'password');

      // Assert
      expect(result).toEqual('mockJwtToken');
    });

    it('should call compareAsync with correct arguments', async () => {
      // Arrange
      user.password = 'hashedPassword';
      jest.spyOn(userService, 'findByEmailAsync').mockResolvedValueOnce(user);

      const compareAsyncSpy = jest
        .spyOn(encryptionService, 'compareAsync')
        .mockResolvedValueOnce(true);

      // Act
      await service.signInAsync('test@test.com', 'password');

      // Assert
      expect(compareAsyncSpy).toHaveBeenCalledWith(
        'password',
        'hashedPassword',
      );
    });

    it('should call signAsync with correct payload', async () => {
      // Arrange
      const mockRolePermission1 = mockDeep<
        Prisma.RolePermissionGetPayload<{ include: { permission: true } }>
      >({
        permission: mockDeep<Permission>({ name: 'permission1' }),
      });

      const mockRolePermission2 = mockDeep<
        Prisma.RolePermissionGetPayload<{ include: { permission: true } }>
      >({
        permission: mockDeep<Permission>({ name: 'permission2' }),
      });

      user.role.rolePermissions = [mockRolePermission1, mockRolePermission2];

      jest.spyOn(userService, 'findByEmailAsync').mockResolvedValueOnce(user);
      const signInSpy = jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce('mockJwtToken');
      jest.spyOn(encryptionService, 'compareAsync').mockResolvedValueOnce(true);

      const expectedPermissions = user.role.rolePermissions.map(
        (rolePermission) => rolePermission.permission.name,
      );

      // Act
      await service.signInAsync('test@test.com', 'password');

      // Assert
      expect(signInSpy).toHaveBeenCalledWith({
        email: 'test@test.com',
        sub: 1,
        permissions: expectedPermissions,
      });
    });
  });

  describe('requestPasswordResetAsync', () => {
    it('should return a JWT token when user is found', async () => {
      // Arrange
      jest.spyOn(userService, 'findByEmailAsync').mockResolvedValueOnce(user);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce('mockJwtToken');

      // Act
      const result = await service.requestPasswordResetAsync(user.email);

      // Assert
      expect(result).toBe('mockJwtToken');
    });

    it('should return undefined when user is not found', async () => {
      // Arrange
      jest.spyOn(userService, 'findByEmailAsync').mockResolvedValueOnce(null);

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
      const token = 'mockJwtToken';
      const password = 'mockPassword';
      const payload = { sub: user.id, email: user.email };

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce(payload);
      jest.spyOn(userService, 'findByIdAsync').mockResolvedValueOnce(user);
      jest
        .spyOn(encryptionService, 'hashAsync')
        .mockResolvedValueOnce('hashedPassword');
      const updateUserByIdAsyncSpy = jest
        .spyOn(userService, 'updateUserByIdAsync')
        .mockResolvedValueOnce(user);

      // Act
      await service.resetPasswordAsync(token, password);

      // Assert
      expect(updateUserByIdAsyncSpy).toHaveBeenCalledWith(user.id, {
        ...user,
        password: 'hashedPassword',
      });
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      // Arrange
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValueOnce(new UnauthorizedException());

      // Act & Assert
      await expect(
        service.resetPasswordAsync('invalid-token', 'pass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      // Arrange
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ sub: 99 });
      jest.spyOn(userService, 'findByIdAsync').mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.resetPasswordAsync('valid-token', 'pass'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  it('should throw UnauthorizedException if account is currently locked', async () => {
    // Arrange
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    const mockedUser = {
      ...user,
      accountLockedUntil: futureDate,
    };
    jest
      .spyOn(userService, 'findByEmailAsync')
      .mockResolvedValueOnce(mockedUser);

    // Act
    const action = service.signInAsync(user.email, user.password);

    // Assert
    await expect(action).rejects.toThrow(UnauthorizedException);
  });

  it('should reset login attempts if lock expired', async () => {
    // Arrange
    const pastDate = new Date(Date.now() - 60 * 60 * 1000);
    const mockedUser = {
      ...user,
      accountLockedUntil: pastDate,
    };
    jest
      .spyOn(userService, 'findByEmailAsync')
      .mockResolvedValueOnce(mockedUser);
    jest.spyOn(encryptionService, 'compareAsync').mockResolvedValueOnce(true);
    jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce('mockJwtToken');
    const resetFailedLoginAttemptsAndLockedUntilAsyncSpy = jest
      .spyOn(userService, 'resetFailedLoginAttemptsAndLockedUntilAsync')
      .mockResolvedValueOnce(mockedUser);

    // Act
    await service.signInAsync(user.email, user.password);

    // Assert
    expect(resetFailedLoginAttemptsAndLockedUntilAsyncSpy).toHaveBeenCalledWith(
      user.id,
    );
  });

  it('should lock account after max failed attempts', async () => {
    // Arrange
    const MAX_LOGIN_ATTEMPTS =
      configService.get<number>('MAX_LOGIN_ATTEMPTS') ?? 5;
    jest.spyOn(userService, 'findByEmailAsync').mockResolvedValueOnce(user);
    jest.spyOn(encryptionService, 'compareAsync').mockResolvedValueOnce(false);
    jest
      .spyOn(userService, 'incrementFailedLoginAttemptsAsync')
      .mockResolvedValueOnce(MAX_LOGIN_ATTEMPTS);
    const updateAccountLockedUntilAsyncSpy = jest
      .spyOn(userService, 'updateAccountLockedUntilAsync')
      .mockResolvedValueOnce({
        ...user,
        accountLockedUntil: new Date(Date.now() + 60 * 60 * 1000),
      });

    // Act & Assert
    await expect(
      service.signInAsync('test@test.com', 'wrongPassword'),
    ).rejects.toThrow(UnauthorizedException);
    expect(updateAccountLockedUntilAsyncSpy).toHaveBeenCalled();
  });

  it('should call mailingService.sendAccountLockedEmailAsync when account is locked due to failed attempts', async () => {
    // Arrange
    const MAX_LOGIN_ATTEMPTS =
      configService.get<number>('MAX_LOGIN_ATTEMPTS') ?? 5;
    const mockedUser = {
      ...user,
      accountLockedUntil: null,
    };

    jest
      .spyOn(userService, 'findByEmailAsync')
      .mockResolvedValueOnce(mockedUser);
    jest.spyOn(encryptionService, 'compareAsync').mockResolvedValueOnce(false);
    jest
      .spyOn(userService, 'incrementFailedLoginAttemptsAsync')
      .mockResolvedValueOnce(MAX_LOGIN_ATTEMPTS);

    const sendAccountLockedEmailAsyncSpy = jest
      .spyOn(mailingService, 'sendAccountLockedEmailAsync')
      .mockResolvedValueOnce(undefined);

    jest
      .spyOn(userService, 'updateAccountLockedUntilAsync')
      .mockResolvedValueOnce({ ...mockedUser });

    // Act & Assert
    await expect(
      service.signInAsync(user.email, 'wrongPassword'),
    ).rejects.toThrow(UnauthorizedException);

    expect(sendAccountLockedEmailAsyncSpy).toHaveBeenCalled();
  });

  it('should return remaining attempts when credentials are incorrect', async () => {
    // Arrange
    jest.spyOn(userService, 'findByEmailAsync').mockResolvedValueOnce(user);
    jest.spyOn(encryptionService, 'compareAsync').mockResolvedValueOnce(false);
    jest
      .spyOn(userService, 'incrementFailedLoginAttemptsAsync')
      .mockResolvedValueOnce(1);

    // Act
    const action = service.signInAsync('test@test.com', 'wrongPassword');

    // Assert
    await expect(action).rejects.toThrow(UnauthorizedException);
  });

  describe('checkRegistrationRequestStatusAsync', () => {
    it('should throw UnauthorizedException if registration request status is Pending', async () => {
      // Act & Assert
      await expect(
        service.checkRegistrationRequestStatusAsync(
          RegistrationRequestStatusId.Pending,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if registration request status is Rejected', async () => {
      // Act & Assert
      await expect(
        service.checkRegistrationRequestStatusAsync(
          RegistrationRequestStatusId.Rejected,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should not throw if registration request is Approved', async () => {
      // Act & Assert
      await expect(
        service.checkRegistrationRequestStatusAsync(
          RegistrationRequestStatusId.Approved,
        ),
      ).resolves.not.toThrow();
    });
  });
});
