import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { VercelBlobService } from './vercel-blob.service';

@Module({
  imports: [ConfigModule],
  providers: [VercelBlobService],
  exports: [VercelBlobService],
})
export class VercelBlobServiceModule {}
