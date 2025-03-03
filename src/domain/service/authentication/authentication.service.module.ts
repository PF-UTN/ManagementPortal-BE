import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { UserServiceModule } from '../user/user.service.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT } from './authentication.constants';

@Module({
  imports: [UserServiceModule, JwtModule.register({
    global: true,
    secret: JWT.SECRET,
    signOptions: { expiresIn: JWT.EXPIRATION },
  })],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationServiceModule {}
