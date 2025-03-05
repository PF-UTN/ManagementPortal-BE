import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { UserServiceModule } from '../user/user.service.module';
import { JWT } from './authentication.constants';

@Module({
  imports: [UserServiceModule, JWT],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationServiceModule {}
