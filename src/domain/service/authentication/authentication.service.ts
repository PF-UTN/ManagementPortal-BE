import { EncryptionService } from '@mp/common/services';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../user/user.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService,
  ) {}

  async signInAsync(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.findByEmailAsync(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const isMatch = await this.encryptionService.compareAsync(
      password,
      user.password,
    );
    if (!isMatch) {
      throw new UnauthorizedException();
    }

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
