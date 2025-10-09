import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GoogleMapsRoutingService } from './google-maps-routing.service';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [GoogleMapsRoutingService],
  exports: [GoogleMapsRoutingService],
})
export class GoogleMapsRoutingServiceModule {}
