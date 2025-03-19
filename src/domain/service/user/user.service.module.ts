import { Module } from '@nestjs/common';
import { RepositoryModule } from '@mp/repository';
import { EncryptionServiceModule } from '@mp/common/services';
import { UserService } from './user.service';

@Module({
  imports: [RepositoryModule, EncryptionServiceModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserServiceModule {}
