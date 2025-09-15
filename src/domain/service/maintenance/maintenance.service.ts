import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

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

    if (vehicle.kmTraveled > maintenanceCreationDto.kmPerformed) {
      throw new BadRequestException(
        `Maintenance mileage cannot be less than the vehicle's current mileage.`,
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

    const maintenancePlanItem =
      await this.maintenancePlanItemRepository.findByIdAsync(
        maintenance.maintenancePlanItemId,
      );

    if (!maintenancePlanItem) {
      throw new NotFoundException(
        `Maintenance plan item with id ${maintenance.maintenancePlanItemId} does not exist.`,
      );
    }

    const vehicle = await this.vehicleRepository.findByIdAsync(
      maintenancePlanItem.vehicleId,
    );

    if (!vehicle) {
      throw new NotFoundException(
        `Vehicle with id ${maintenancePlanItem.vehicleId} does not exist.`,
      );
    }

    if (vehicle.kmTraveled > updateMaintenanceDto.kmPerformed) {
      throw new BadRequestException(
        `Maintenance mileage cannot be less than the vehicle's current mileage.`,
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
}
