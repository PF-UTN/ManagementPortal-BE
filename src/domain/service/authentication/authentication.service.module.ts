import { Module } from '@nestjs/common';
import { EncryptionServiceModule } from '@mp/common/services';
import { AuthenticationService } from './authentication.service';
import { UserServiceModule } from '../user/user.service.module';
import { JWT } from './authentication.constants';

@Module({
  imports: [UserServiceModule, JWT, EncryptionServiceModule],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationServiceModule {}
