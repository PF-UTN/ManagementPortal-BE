import { Module } from '@nestjs/common';

import { CreateVehicleMaintenancePlanItemCommandHandler } from './command/create-vehicle-maintenance-plan-item.command.handler';
import { CreateVehicleRepairCommandHandler } from './command/create-vehicle-repair.command.handler';
import { CreateVehicleCommandHandler } from './command/create-vehicle.command.handler';
import { DeleteVehicleMaintenancePlanItemCommandHandler } from './command/delete-vehicle-maintenance-plan-item.command.handler';
import { DeleteVehicleRepairCommandHandler } from './command/delete-vehicle-repair.command.handler';
import { DeleteVehicleCommandHandler } from './command/delete-vehicle.command.handler';
import { UpdateVehicleMaintenancePlanItemCommandHandler } from './command/update-vehicle-maintenance-plan-item.command.handler';
import { UpdateVehicleRepairCommandHandler } from './command/update-vehicle-repair.command.handler';
import { UpdateVehicleCommandHandler } from './command/update-vehicle.command.handler';
import { SearchMaintenancePlanItemQueryHandler } from './query/search-maintenance-plan-item-query.handler';
import { SearchMaintenanceQueryHandler } from './query/search-maintenance-query.handler';
import { SearchRepairQueryHandler } from './query/search-repair-query.handler';
import { SearchVehicleQueryHandler } from './query/search-vehicle-query.handler';
import { VehicleController } from './vehicle.controller';
import { MaintenanceServiceModule } from '../../domain/service/maintenance/maintenance.service.module';
import { MaintenancePlanItemServiceModule } from '../../domain/service/maintenance-plan-item/maintenance-plan-item.service.module';
import { RepairServiceModule } from '../../domain/service/repair/repair.service.module';
import { VehicleServiceModule } from '../../domain/service/vehicle/vehicle.service.module';

const queryHandlers = [
  SearchVehicleQueryHandler,
  SearchRepairQueryHandler,
  SearchMaintenanceQueryHandler,
  SearchMaintenancePlanItemQueryHandler,
];
const commandHandlers = [
  CreateVehicleCommandHandler,
  DeleteVehicleCommandHandler,
  UpdateVehicleCommandHandler,
  DeleteVehicleRepairCommandHandler,
  CreateVehicleRepairCommandHandler,
  CreateVehicleMaintenancePlanItemCommandHandler,
  UpdateVehicleMaintenancePlanItemCommandHandler,
  UpdateVehicleRepairCommandHandler,
  DeleteVehicleMaintenancePlanItemCommandHandler
];

@Module({
  imports: [
    VehicleServiceModule,
    RepairServiceModule,
    MaintenancePlanItemServiceModule,
    MaintenanceServiceModule,
  ],
  controllers: [VehicleController],
  providers: [...queryHandlers, ...commandHandlers],
})
export class VehicleModule {}
