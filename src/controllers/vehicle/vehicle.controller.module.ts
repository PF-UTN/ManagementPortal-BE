import { Module } from '@nestjs/common';

import { CreateVehicleRepairCommandHandler } from './command/create-vehicle-repair.command.handler';
import { CreateVehicleCommandHandler } from './command/create-vehicle.command.handler';
import { DeleteVehicleRepairCommandHandler } from './command/delete-vehicle-repair.command.handler';
import { DeleteVehicleCommandHandler } from './command/delete-vehicle.command.handler';
import { UpdateVehicleCommandHandler } from './command/update-vehicle.command.handler';
import { SearchVehicleQueryHandler } from './query/search-vehicle-query.handler';
import { VehicleController } from './vehicle.controller';
import { RepairServiceModule } from '../../domain/service/repair/repair.service.module';
import { VehicleServiceModule } from '../../domain/service/vehicle/vehicle.service.module';

const queryHandlers = [SearchVehicleQueryHandler];
const commandHandlers = [
  CreateVehicleCommandHandler,
  DeleteVehicleCommandHandler,
  UpdateVehicleCommandHandler,
  DeleteVehicleRepairCommandHandler,
  CreateVehicleRepairCommandHandler,
];

@Module({
  imports: [VehicleServiceModule, RepairServiceModule],
  controllers: [VehicleController],
  providers: [...queryHandlers, ...commandHandlers],
})
export class VehicleModule {}
