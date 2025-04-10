import { Module } from '@nestjs/common';

import { EncryptionService } from './encryption.service';

@Module({
  imports: [],
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class EncryptionServiceModule {}
