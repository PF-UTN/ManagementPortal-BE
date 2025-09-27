import { Module } from '@nestjs/common';

import { MailingServiceModule } from '@mp/common/services';
import { RepositoryModule } from '@mp/repository';

import { ShipmentService } from './shipment.service';

@Module({
  imports: [RepositoryModule, MailingServiceModule],
  providers: [ShipmentService],
  exports: [ShipmentService],
})
export class ShipmentServiceModule {}
