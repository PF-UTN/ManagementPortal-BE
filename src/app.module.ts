import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthenticationModule } from './authentication/authentication.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    CqrsModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''}.env`,
    }),
    AuthenticationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
