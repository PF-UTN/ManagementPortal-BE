import { Module } from '@nestjs/common';

import { CreateShipmentCommandHandler } from './command/create-shipment.command.handler';
import { FinishShipmentCommandHandler } from './command/finish-shipment.command.handler';
import { SendShipmentCommandHandler } from './command/send-shipment.command.handler';
import { GetShipmentByIdQueryHandler } from './query/get-shipment-by-id.query.handler';
import { ShipmentController } from './shipment.controller';
import { ShipmentServiceModule } from '../../domain/service/shipment/shipment.service.module';

const queryHandlers = [GetShipmentByIdQueryHandler];
const commandHandlers = [
  CreateShipmentCommandHandler,
  SendShipmentCommandHandler,
  FinishShipmentCommandHandler,
];

@Module({
  imports: [ShipmentServiceModule],
  controllers: [ShipmentController],
  providers: [...queryHandlers, ...commandHandlers],
})
export class ShipmentModule {}
