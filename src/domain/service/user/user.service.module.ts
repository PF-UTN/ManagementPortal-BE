import { Module } from '@nestjs/common';
import { RepositoryModule } from '@mp/repository';
import { UserService } from './user.service';

@Module({
  imports: [RepositoryModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserServiceModule {}
