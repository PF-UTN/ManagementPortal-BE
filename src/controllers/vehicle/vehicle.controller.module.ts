import { Module } from '@nestjs/common';

import { CreateVehicleCommandHandler } from './command/create-vehicle.command.handler';
import { SearchVehicleQueryHandler } from './query/search-vehicle-query.handler';
import { VehicleController } from './vehicle.controller';
import { VehicleServiceModule } from '../../domain/service/vehicle/vehicle.service.module';

const queryHandlers = [SearchVehicleQueryHandler];
const commandHandlers = [CreateVehicleCommandHandler];

@Module({
  imports: [VehicleServiceModule],
  controllers: [VehicleController],
  providers: [...queryHandlers, ...commandHandlers],
})
export class VehicleModule {}
