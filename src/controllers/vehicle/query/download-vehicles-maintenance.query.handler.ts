import { StreamableFile } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DownloadVehiclesMaintenanceQuery } from './download-vehicles-maintenance-query';
import {
  DateHelper,
  ExcelExportHelper,
  ExcelPage,
} from '../../../../libs/common/src/helpers';
import { MaintenanceService } from '../../../domain/service/maintenance/maintenance.service';
import { RepairService } from '../../../domain/service/repair/repair.service';
import { VehicleService } from '../../../domain/service/vehicle/vehicle.service';
export interface MaintenancePlanExcelRow {
  ID: number;
  Descripción: string;
  Intervalo_KM: number | string;
  Intervalo_Tiempo: string;
}

export interface MaintenanceJobExcelRow {
  ID: number;
  Fecha: Date;
  KM_Realizados: number;
  Item_Mantenimiento: string;
  Proveedor: string;
}

export interface RepairExcelRow {
  ID: number;
  Fecha: Date;
  Descripción: string;
  KM_Realizados: number;
  Proveedor: string;
}

@QueryHandler(DownloadVehiclesMaintenanceQuery)
export class DownloadVehiclesMaintenanceQueryHandler
  implements IQueryHandler<DownloadVehiclesMaintenanceQuery>
{
  constructor(
    private readonly vehicleService: VehicleService,
    private readonly maintenanceService: MaintenanceService,
    private readonly repairService: RepairService,
  ) {}

  async execute(
    query: DownloadVehiclesMaintenanceQuery,
  ): Promise<StreamableFile> {
    const vehicle = await this.vehicleService.findByIdAsync(query.id);

    const maintenanceWithItems =
      await this.maintenanceService.findByVehicleIdAsync(query.id);

    const maintenancePlanSheet: ExcelPage<MaintenancePlanExcelRow> = {
      sheetName: 'Plan de Mantenimiento',
      data: maintenanceWithItems.map((m) => ({
        ID: m.maintenancePlanItem.maintenanceItem.id,
        Descripción: m.maintenancePlanItem.maintenanceItem.description,
        Intervalo_KM: m.maintenancePlanItem.kmInterval ?? '-',
        Intervalo_Tiempo: m.maintenancePlanItem.timeInterval
          ? `${m.maintenancePlanItem.timeInterval} ${m.maintenancePlanItem.timeInterval === 1 ? 'mes' : 'meses'}`
          : '-',
      })),
    };

    const maintenanceJobsSheet: ExcelPage<MaintenanceJobExcelRow> = {
      sheetName: 'Trabajos de Mantenimiento',
      data: maintenanceWithItems.map((maintenance) => ({
        ID: maintenance.id,
        Fecha: maintenance.date,
        KM_Realizados: maintenance.kmPerformed,
        Item_Mantenimiento:
          maintenance.maintenancePlanItem.maintenanceItem.description,
        Proveedor: [
          maintenance.serviceSupplier.businessName,
          maintenance.serviceSupplier.email,
          maintenance.serviceSupplier.phone,
        ].join(' - '),
      })),
    };
    const repairs = await this.repairService.findByVehicleIdAsync(query.id);

    const repairsSheet: ExcelPage<RepairExcelRow> = {
      sheetName: 'Reparaciones',
      data: repairs.map((repair) => ({
        ID: repair.id,
        Fecha: repair.date,
        Descripción: repair.description,
        KM_Realizados: repair.kmPerformed,
        Proveedor: [
          repair.serviceSupplier.businessName,
          repair.serviceSupplier.email,
          repair.serviceSupplier.phone,
        ].join(' - '),
      })),
    };

    const buffer = ExcelExportHelper.exportToMultipleExcelBuffers([
      maintenancePlanSheet,
      maintenanceJobsSheet,
      repairsSheet,
    ]);

    const filename = `${DateHelper.formatYYYYMMDD(new Date())} - Listado Mantenimiento y Reparacion - ${vehicle!.licensePlate}`;

    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      length: buffer.length,
      disposition: `attachment; filename="${filename}"`,
    });
  }
}
