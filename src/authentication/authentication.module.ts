import { Module } from '@nestjs/common';
import { AuthenticationService } from '../domain/service/authentication.service';
import { AuthenticationController } from './authentication.controller';
import { UserRepository } from 'src/libs/repository/user.repository';
import { PrismaService } from 'src/prisma.service';
import { SignUpCommandHandler } from './command/sign-up.command.handler';

@Module({
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    SignUpCommandHandler,
    UserRepository,
    PrismaService,
  ],
})
export class AuthenticationModule {}
