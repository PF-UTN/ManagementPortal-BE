import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { TokenPayload } from '@mp/common/models';
import { EncryptionService, MailingService } from '@mp/common/services';

import { UserService } from '../user/user.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService,
    private readonly mailingService: MailingService,
  ) {}

  async signInAsync(email: string, password: string): Promise<string> {
    const user = await this.userService.findByEmailAsync(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      throw new UnauthorizedException(
        'Account is locked due to too many failed login attempts. Please try again later or reset your password.',
      );
    } else if (user.accountLockedUntil) {
      await this.userService.resetFailedLoginAttemptsAndLockedUntilAsync(
        user.id,
      );
    }

    const MAX_LOGIN_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS) || 3;

    const isMatch = await this.encryptionService.compareAsync(
      password,
      user.password,
    );

    if (!isMatch) {
      const loginAttempts =
        await this.userService.incrementFailedLoginAttemptsAsync(user.id);

      if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockedUntil = new Date();
        lockedUntil.setMinutes(lockedUntil.getMinutes() + 60);
        await this.userService.updateAccountLockedUntilAsync(
          user.id,
          lockedUntil,
        );

        await this.mailingService.sendAccountLockedEmailAsync(
          user.email,
          lockedUntil,
        );

        throw new UnauthorizedException(
          'Account is locked due to too many failed login attempts. Please try again later or reset your password.',
        );
      }

      throw new UnauthorizedException(
        `Invalid credentials. You have ${MAX_LOGIN_ATTEMPTS - loginAttempts} login attempts left.`,
      );
    }

    await this.userService.resetFailedLoginAttemptsAndLockedUntilAsync(user.id);

    const payload = {
      email: user.email,
      sub: user.id,
      permissions: user.role.rolePermissions.map(
        (rolePermission) => rolePermission.permission.name,
      ),
    } as TokenPayload;

    return await this.jwtService.signAsync(payload);
  }

  async requestPasswordResetAsync(email: string) {
    const user = await this.userService.findByEmailAsync(email);

    if (!user) {
      return;
    }

    const payload = {
      email: user.email,
      sub: user.id,
    };

    return await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('JWT_RESET_PASSWORD_EXPIRATION'),
    });
  }

  async resetPasswordAsync(token: string, password: string) {
    const payload = await this.jwtService.verifyAsync(token);

    if (!payload) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.userService.findByIdAsync(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const hashedPassword = await this.encryptionService.hashAsync(password);
    await this.userService.updateUserByIdAsync(user.id, {
      ...user,
      password: hashedPassword,
    });
  }
}
