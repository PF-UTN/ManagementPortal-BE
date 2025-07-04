import { BadRequestException, Injectable } from '@nestjs/common';
import { Vehicle } from '@prisma/client';

import { VehicleCreationDto } from '@mp/common/dtos';
import { VehicleRepository } from '@mp/repository';

import { SearchVehicleQuery } from '../../../controllers/vehicle/query/search-vehicle-query';

@Injectable()
export class VehicleService {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async existsByLicensePlateAsync(licensePlate: string): Promise<boolean> {
    return this.vehicleRepository.existsByLicensePlateAsync(licensePlate);
  }

  async createVehicleAsync(vehicleCreationDto: VehicleCreationDto): Promise<Vehicle> {
    const existsVehicle = await this.existsByLicensePlateAsync(vehicleCreationDto.licensePlate);

    if (existsVehicle) {
      throw new BadRequestException(
        `Vehicle with license plate ${vehicleCreationDto.licensePlate} already exists.`,
      );
    }

    return await this.vehicleRepository.createVehicleAsync(vehicleCreationDto);
  }

  async searchByTextAsync(query: SearchVehicleQuery) {
      return await this.vehicleRepository.searchByTextAsync(
        query.searchText,
        query.page,
        query.pageSize,
      );
    }
}
