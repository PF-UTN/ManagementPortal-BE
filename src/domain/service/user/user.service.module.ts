import { Module } from '@nestjs/common';

import { EncryptionServiceModule } from '@mp/common/services';
import { RepositoryModule } from '@mp/repository';

import { UserService } from './user.service';

@Module({
  imports: [RepositoryModule, EncryptionServiceModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserServiceModule {}
