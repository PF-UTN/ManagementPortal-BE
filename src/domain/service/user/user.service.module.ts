import { Module } from '@nestjs/common';

import { EncryptionServiceModule } from '@mp/common/services';
import { RepositoryModule } from '@mp/repository';

import { UserService } from './user.service';
import { TownServiceModule } from '../town/town.service.module';

@Module({
  imports: [RepositoryModule, EncryptionServiceModule, TownServiceModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserServiceModule {}
