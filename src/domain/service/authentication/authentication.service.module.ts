import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { UserServiceModule } from '../user/user.service.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './authentication.constants';

@Module({
  imports: [UserServiceModule, JwtModule.register({
    global: true,
    secret: jwtConstants.secret,
    signOptions: { expiresIn: '60m' },
  })],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationServiceModule {}
