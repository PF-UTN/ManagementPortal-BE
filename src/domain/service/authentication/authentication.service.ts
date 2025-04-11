import { EncryptionService } from '@mp/common/services';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
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
      expiresIn: '15m',
    });
  }
}
