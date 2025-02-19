import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';

@Module({
  imports: [CqrsModule.forRoot(), AuthenticationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
