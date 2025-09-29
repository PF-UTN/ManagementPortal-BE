import { Module } from '@nestjs/common';

import { CreateShipmentCommandHandler } from './command/create-shipment.command.handler';
import { SendShipmentCommandHandler } from './command/send-shipment.command.handler';
import { ShipmentController } from './shipment.controller';
import { ShipmentServiceModule } from '../../domain/service/shipment/shipment.service.module';

const commandHandlers = [
  CreateShipmentCommandHandler,
  SendShipmentCommandHandler,
];

@Module({
  imports: [ShipmentServiceModule],
  controllers: [ShipmentController],
  providers: [...commandHandlers],
})
export class ShipmentModule {}
