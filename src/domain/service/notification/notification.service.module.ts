import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { NotificationService } from './notification.service';

@Module({
  imports: [RepositoryModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationServiceModule {}
