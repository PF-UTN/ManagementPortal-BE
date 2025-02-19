import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from '../../../libs/repository/user.repository';
import { PrismaService } from '../../../prisma.service';

@Module({
  providers: [UserService, UserRepository, PrismaService],
  exports: [UserService],
})
export class UserServiceModule {}
