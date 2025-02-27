import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthenticationService {
    constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {}

    async signIn(email: string, password: string): Promise<{ access_token: string }> {
        const user = await this.userService.findByEmail(email);
        if (user?.password !== password) {
            throw new UnauthorizedException();
        }

        const payload = { email: user.email, sub: user.id };

        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }
}
