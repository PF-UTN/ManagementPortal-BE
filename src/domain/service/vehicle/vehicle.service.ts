import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async createVehicleAsync(
    vehicleCreationDto: VehicleCreationDto,
  ): Promise<Vehicle> {
    const existsVehicle = await this.existsByLicensePlateAsync(
      vehicleCreationDto.licensePlate,
    );

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

  async deleteVehicleAsync(id: number) {
    const existsVehicle = await this.vehicleRepository.existsAsync(id);

    if (!existsVehicle) {
      throw new NotFoundException(`Vehicle with id ${id} does not exist.`);
    }

    return await this.vehicleRepository.deleteVehicleAsync(id);
  }
}
