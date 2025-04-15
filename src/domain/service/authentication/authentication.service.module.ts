import {
  EncryptionServiceModule,
  MailingServiceModule,
} from '@mp/common/services';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthenticationService } from './authentication.service';
import { UserServiceModule } from '../user/user.service.module';

@Module({
  imports: [
    UserServiceModule,
    EncryptionServiceModule,
    ConfigModule,
    MailingServiceModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') },
      }),
    }),
  ],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationServiceModule {}
