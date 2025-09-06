import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { RegistrationRequestStatusId } from '@mp/common/constants';
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
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      throw new UnauthorizedException(
        'La cuenta está bloqueada por demasiados intentos fallidos de inicio de sesión. Por favor, intentá nuevamente más tarde o restablecé tu contraseña.',
      );
    } else if (user.accountLockedUntil) {
      await this.userService.resetFailedLoginAttemptsAndLockedUntilAsync(
        user.id,
      );
    }

    const MAX_LOGIN_ATTEMPTS =
      this.configService.get<number>('MAX_LOGIN_ATTEMPTS') ?? 5;

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
          'La cuenta está bloqueada por demasiados intentos fallidos de inicio de sesión. Por favor, intentá nuevamente más tarde o restablecé tu contraseña.',
        );
      }

      throw new UnauthorizedException(
        `Credenciales inválidas. Te quedan ${MAX_LOGIN_ATTEMPTS - loginAttempts} intentos de inicio de sesión.`,
      );
    }

    await this.userService.resetFailedLoginAttemptsAndLockedUntilAsync(user.id);

    await this.checkRegistrationRequestStatusAsync(
      user.registrationRequest?.statusId,
    );

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role.name,
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
      expiresIn: this.configService.get<string>(
        'JWT_RESET_PASSWORD_EXPIRATION',
      ),
    });
  }

  async resetPasswordAsync(token: string, password: string) {
    const payload = await this.jwtService.verifyAsync(token);

    const user = await this.userService.findByIdAsync(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    const hashedPassword = await this.encryptionService.hashAsync(password);
    await this.userService.updateUserByIdAsync(user.id, {
      ...user,
      password: hashedPassword,
      accountLockedUntil: null,
      failedLoginAttempts: 0,
    });
  }

  async checkRegistrationRequestStatusAsync(statusId: number | undefined) {
    switch (statusId) {
      case RegistrationRequestStatusId.Approved:
        return;
      case RegistrationRequestStatusId.Pending:
        throw new UnauthorizedException(
          `Tu solicitud de registro todavía está siendo procesada. Para más información, por favor contactá al soporte: ${this.configService.get('SUPPORT_EMAIL')}`,
        );
      case RegistrationRequestStatusId.Rejected:
        throw new UnauthorizedException(
          `Lamentablemente, tu solicitud de registro fue rechazada. Para más información, por favor contactá al soporte: ${this.configService.get('SUPPORT_EMAIL')}`,
        );
      default:
        throw new UnauthorizedException(
          `Hubo un error con tu solicitud de registro. Por favor contactá al soporte: ${this.configService.get('SUPPORT_EMAIL')}`,
        );
    }
  }
  async decodeTokenAsync(token: string) {
    return this.jwtService.decode(token) as TokenPayload;
  }
}
