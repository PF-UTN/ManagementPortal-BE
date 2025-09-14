import { StreamableFile } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

export class DownloadVehiclesMaintenanceQuery extends Query<StreamableFile> {
  constructor(public id: number) {
    super();
  }
}
