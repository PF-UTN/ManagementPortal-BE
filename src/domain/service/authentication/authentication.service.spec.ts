import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Permission, Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { EncryptionService } from '@mp/common/services';

import { AuthenticationService } from './authentication.service';
import { UserService } from '../user/user.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userService: jest.Mocked<UserService>;
  let jwtService: JwtService;
  let encryptionService: EncryptionService;
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
      ],
    }).compile();

    userService = module.get(UserService);
    jwtService = module.get<JwtService>(JwtService);
    encryptionService = module.get<EncryptionService>(EncryptionService);

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
        };
      }>
    >();

    user.email = 'test@test.com';
    user.password = 'hashedPassword';
    user.id = 1;
    user.role.rolePermissions = [];
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

    it('should throw UnauthorizedException if password is incorrect', async () => {
      // Arrange
      user.password = 'wrongPassword';
      jest.spyOn(userService, 'findByEmailAsync').mockResolvedValueOnce(user);

      // Act
      const action = service.signInAsync('test@test.com', 'password');

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
});
