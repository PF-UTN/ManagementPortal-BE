import { Injectable, NotFoundException } from '@nestjs/common';

import { RepairCreationDataDto, RepairCreationDto } from '@mp/common/dtos';
import {
  RepairRepository,
  ServiceSupplierRepository,
  VehicleRepository,
} from '@mp/repository';

@Injectable()
export class RepairService {
  constructor(
    private readonly repairRepository: RepairRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly serviceSupplierRepository: ServiceSupplierRepository,
  ) {}

  async deleteRepairAsync(id: number) {
    const existsRepair = await this.repairRepository.existsAsync(id);

    if (!existsRepair) {
      throw new NotFoundException(`Repair with id ${id} does not exist.`);
    }

    return await this.repairRepository.deleteRepairAsync(id);
  }

  async createRepairAsync(
    vehicleId: number,
    repairCreationDto: RepairCreationDto,
  ) {
    const existsVehicle = await this.vehicleRepository.existsAsync(vehicleId);

    if (!existsVehicle) {
      throw new NotFoundException(
        `Vehicle with id ${vehicleId} does not exist.`,
      );
    }

    const existsServiceSupplier =
      await this.serviceSupplierRepository.existsAsync(
        repairCreationDto.serviceSupplierId,
      );

    if (!existsServiceSupplier) {
      throw new NotFoundException(
        `Service supplier with id ${repairCreationDto.serviceSupplierId} does not exist.`,
      );
    }

    const repairCreationDataDto: RepairCreationDataDto = {
      vehicleId,
      ...repairCreationDto,
    };

    return await this.repairRepository.createRepairAsync(repairCreationDataDto);
  }
}
