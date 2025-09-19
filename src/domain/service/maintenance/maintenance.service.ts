import { Injectable, NotFoundException } from '@nestjs/common';

import { MaintenanceCreationDto, UpdateMaintenanceDto } from '@mp/common/dtos';
import {
  MaintenancePlanItemRepository,
  MaintenanceRepository,
  ServiceSupplierRepository,
  VehicleRepository,
} from '@mp/repository';

import { SearchMaintenanceQuery } from '../../../controllers/vehicle/query/search-maintenance-query';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly maintenanceRepository: MaintenanceRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly maintenancePlanItemRepository: MaintenancePlanItemRepository,
    private readonly serviceSupplierRepository: ServiceSupplierRepository,
  ) {}

  async findByVehicleIdAsync(vehicleId: number) {
    return await this.maintenanceRepository.findByVehicleIdAsync(vehicleId);
  }

  async searchByTextAndVehicleIdAsync(query: SearchMaintenanceQuery) {
    const existsVehicle = await this.vehicleRepository.existsAsync(
      query.vehicleId,
    );

    if (!existsVehicle) {
      throw new NotFoundException(
        `Vehicle with id ${query.vehicleId} does not exist.`,
      );
    }

    return await this.maintenanceRepository.searchByTextAndVehicleIdAsync(
      query.searchText,
      query.page,
      query.pageSize,
      query.vehicleId,
    );
  }

  async createMaintenanceAsync(
    vehicleId: number,
    maintenanceCreationDto: MaintenanceCreationDto,
  ) {
    const vehicle = await this.vehicleRepository.findByIdAsync(vehicleId);

    if (!vehicle) {
      throw new NotFoundException(
        `Vehicle with id ${vehicleId} does not exist.`,
      );
    }

    const existsMaintenancePlanItem =
      await this.maintenancePlanItemRepository.existsByIdAndVehicleIdAsync(
        maintenanceCreationDto.maintenancePlanItemId,
        vehicleId,
      );

    if (!existsMaintenancePlanItem) {
      throw new NotFoundException(
        `Maintenance plan item with id ${maintenanceCreationDto.maintenancePlanItemId} does not exist or does not belong to the vehicle with id ${vehicleId}.`,
      );
    }

    const existsServiceSupplier =
      await this.serviceSupplierRepository.existsAsync(
        maintenanceCreationDto.serviceSupplierId,
      );

    if (!existsServiceSupplier) {
      throw new NotFoundException(
        `Service supplier with id ${maintenanceCreationDto.serviceSupplierId} does not exist.`,
      );
    }

    return await this.maintenanceRepository.createMaintenanceAsync(
      maintenanceCreationDto,
    );
  }

  async updateMaintenanceAsync(
    maintenanceId: number,
    updateMaintenanceDto: UpdateMaintenanceDto,
  ) {
    const maintenance =
      await this.maintenanceRepository.findByIdAsync(maintenanceId);

    if (!maintenance) {
      throw new NotFoundException(
        `Maintenance with id ${maintenanceId} does not exist.`,
      );
    }

    const existsServiceSupplier =
      await this.serviceSupplierRepository.existsAsync(
        updateMaintenanceDto.serviceSupplierId,
      );

    if (!existsServiceSupplier) {
      throw new NotFoundException(
        `Service supplier with id ${updateMaintenanceDto.serviceSupplierId} does not exist.`,
      );
    }

    return await this.maintenanceRepository.updateMaintenanceAsync(
      maintenanceId,
      updateMaintenanceDto,
    );
  }

  async deleteMaintenanceAsync(id: number) {
    const existsMaintenance = await this.maintenanceRepository.existsAsync(id);

    if (!existsMaintenance) {
      throw new NotFoundException(`Maintenance with id ${id} does not exist.`);
    }

    return await this.maintenanceRepository.deleteMaintenanceAsync(id);
  }
}
