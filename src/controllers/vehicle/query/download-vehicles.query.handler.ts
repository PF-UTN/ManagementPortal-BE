import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DownloadVehicleDto } from '@mp/common/dtos';

import { DownloadVehiclesQuery } from './download-vehicles-query';
import { VehicleService } from '../../../domain/service/vehicle/vehicle.service';

@QueryHandler(DownloadVehiclesQuery)
export class DownloadVehiclesQueryHandler
  implements IQueryHandler<DownloadVehiclesQuery>
{
  constructor(private readonly vehicleService: VehicleService) {}

  async execute(query: DownloadVehiclesQuery): Promise<DownloadVehicleDto[]> {
    const data = await this.vehicleService.downloadBySearchTextAsync(
      query.searchText,
    );

    return data.map((vehicle): DownloadVehicleDto => {
      return {
        ID: vehicle.id,
        Patente: vehicle.licensePlate,
        Marca: vehicle.brand,
        Modelo: vehicle.model,
        Kilometros_Recorridos: vehicle.kmTraveled,
        Fecha_Admisión: vehicle.admissionDate,
        Habilitado: vehicle.enabled ? 'Sí' : 'No',
      };
    });
  }
}
