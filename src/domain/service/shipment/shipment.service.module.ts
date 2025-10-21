import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { ShipmentService } from './shipment.service';
import { GoogleMapsRoutingServiceModule } from '../../../services/google-maps-routing.service.module';

@Module({
  imports: [RepositoryModule, GoogleMapsRoutingServiceModule],
  providers: [ShipmentService],
  exports: [ShipmentService],
})
export class ShipmentServiceModule {}
