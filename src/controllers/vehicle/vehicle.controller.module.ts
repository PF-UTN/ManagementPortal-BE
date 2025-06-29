import { Module } from '@nestjs/common';

import { CreateVehicleCommandHandler } from './command/create-vehicle.command.handler';
import { VehicleController } from './vehicle.controller';
import { VehicleServiceModule } from '../../domain/service/vehicle/vehicle.service.module';

const commandHandlers = [CreateVehicleCommandHandler];

@Module({
  imports: [VehicleServiceModule],
  controllers: [VehicleController],
  providers: [...commandHandlers],
})
export class VehicleModule {}
