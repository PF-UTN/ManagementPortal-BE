import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthGuard } from './auth.guard';
import { IS_PUBLIC_KEY, PERMISSIONS_KEY } from '../decorators';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;
  let configService: ConfigService;

  beforeEach(async () => {
    const mockJwtService = {
      verifyAsync: jest.fn(),
    };

    const mockReflector = {
      get: jest.fn(),
      getAllAndOverride: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: mockJwtService },
        { provide: Reflector, useValue: mockReflector },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    reflector = module.get<Reflector>(Reflector);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if the route is public', async () => {
    // Arrange
    jest.spyOn(reflector, 'get').mockImplementation((key: string) => {
      if (key === IS_PUBLIC_KEY) return true;
      return false;
    });

    const mockContext = {
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;

    //Act
    const result = await guard.canActivate(mockContext);

    //Assert
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if no token is provided', async () => {
    //Arrange
    jest.spyOn(reflector, 'get').mockReturnValue(false);

    const mockRequest = {
      headers: {},
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;

    //Act & Assert
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should validate the token if is not public', async () => {
    //Arrange
    jest.spyOn(reflector, 'get').mockReturnValue(false);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['read']);
    jest.spyOn(configService, 'get').mockReturnValue('test-secret');
    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockResolvedValue({ permissions: ['read'] });

    const mockRequest = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    //Act
    await guard.canActivate(mockContext);

    //Assert
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
      secret: 'test-secret',
    });
  });

  it('should throw UnauthorizedException if the token is invalid', async () => {
    //Arrange
    jest.spyOn(reflector, 'get').mockReturnValue(false);
    jest.spyOn(configService, 'get').mockReturnValue('test-secret');
    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockRejectedValue(new Error('Invalid token'));

    const mockRequest = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;

    //Act & Assert
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should retrive route permissions', async () => {
    // Arrange
    jest.spyOn(reflector, 'get').mockReturnValue(false);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['read']);
    jest.spyOn(configService, 'get').mockReturnValue('test-secret');
    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockResolvedValue({ permissions: ['read'] });

    const mockRequest = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    // Act
    await guard.canActivate(mockContext);

    // Assert
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(PERMISSIONS_KEY, [
      mockContext.getHandler(),
      mockContext.getClass(),
    ]);
  });

  it('should throw ForbiddenException if permissions are insufficient', async () => {
    //Arrange
    jest.spyOn(reflector, 'get').mockReturnValue(false);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['write']);
    jest.spyOn(configService, 'get').mockReturnValue('test-secret');
    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockResolvedValue({ permissions: ['read'] });

    const mockRequest = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    //Act & Assert
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
