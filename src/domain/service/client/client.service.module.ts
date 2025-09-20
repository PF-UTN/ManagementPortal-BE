import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { ClientService } from './client.service';

@Module({
  imports: [RepositoryModule],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientServiceModule {}
