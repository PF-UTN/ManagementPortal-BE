import { Injectable } from '@nestjs/common';

import { MaintenanceItemCreationDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';

@Injectable()
export class MaintenanceItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async existsAsync(id: number): Promise<boolean> {
    const maintenanceItem = await this.prisma.maintenanceItem.findUnique({
      select: { id: true },
      where: { id },
    });
    return !!maintenanceItem;
  }

  async createMaintenanceItemAsync(data: MaintenanceItemCreationDto) {
    return this.prisma.maintenanceItem.create({
      data,
    });
  }
}
