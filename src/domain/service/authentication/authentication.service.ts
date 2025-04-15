import { EncryptionService, MailingService } from '@mp/common/services';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../user/user.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
    private readonly mailingService: MailingService,
  ) {}

  async signInAsync(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
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
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
