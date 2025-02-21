import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { UserServiceModule } from '../user/user.service.module';

@Module({
  imports: [UserServiceModule],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationServiceModule {}
