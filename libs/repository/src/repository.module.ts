import { Module } from '@nestjs/common';
import { UserRepository, PrismaService } from './services';

@Module({
  providers: [PrismaService, UserRepository],
  exports: [UserRepository],
})
export class RepositoryModule {}
