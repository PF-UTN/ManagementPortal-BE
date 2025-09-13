import { Injectable, NotFoundException } from '@nestjs/common';

import {
  RepairCreationDataDto,
  RepairCreationDto,
  UpdateRepairDto,
} from '@mp/common/dtos';
import {
  RepairRepository,
  ServiceSupplierRepository,
  VehicleRepository,
} from '@mp/repository';

import { SearchRepairQuery } from '../../../controllers/vehicle/query/search-repair-query';

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

  async searchByTextAndVehicleIdAsync(query: SearchRepairQuery) {
    const existsVehicle = await this.vehicleRepository.existsAsync(
      query.vehicleId,
    );

    if (!existsVehicle) {
      throw new NotFoundException(
        `Vehicle with id ${query.vehicleId} does not exist.`,
      );
    }

    return await this.repairRepository.searchByTextAndVehicleIdAsync(
      query.searchText,
      query.page,
      query.pageSize,
      query.vehicleId,
    );
  }

  async findByVehicleIdAsync(vehicleId: number) {
    return await this.repairRepository.findByVehicleIdAsync(vehicleId);
  }

  async updateRepairAsync(id: number, updateRepairDto: UpdateRepairDto) {
    const existsRepair = await this.repairRepository.existsAsync(id);

    if (!existsRepair) {
      throw new NotFoundException(`Repair with id ${id} does not exist.`);
    }

    const existsServiceSupplier =
      await this.serviceSupplierRepository.existsAsync(
        updateRepairDto.serviceSupplierId,
      );

    if (!existsServiceSupplier) {
      throw new NotFoundException(
        `Service supplier with id ${updateRepairDto.serviceSupplierId} does not exist.`,
      );
    }

    return await this.repairRepository.updateRepairAsync(id, updateRepairDto);
  }
}
