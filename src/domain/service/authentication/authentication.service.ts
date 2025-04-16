import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { TokenPayload } from '@mp/common/models';
import { EncryptionService } from '@mp/common/services';

import { UserService } from '../user/user.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async signInAsync(email: string, password: string): Promise<string> {
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

    const payload = new TokenPayload({
      email: user.email,
      sub: user.id,
      permissions: user.role.rolePermissions.map(
        (rolePermission) => rolePermission.permission.name,
      ),
    });

    return await this.jwtService.signAsync(payload);
  }
}
