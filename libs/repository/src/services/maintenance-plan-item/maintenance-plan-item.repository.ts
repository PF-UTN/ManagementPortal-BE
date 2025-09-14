import { Injectable } from '@nestjs/common';

import {
  MaintenancePlanItemCreationDto,
  UpdateMaintenancePlanItemDto,
} from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';

@Injectable()
export class MaintenancePlanItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMaintenancePlanItemAsync(
    maintenancePlanItemCreationDto: MaintenancePlanItemCreationDto,
  ) {
    return this.prisma.maintenancePlanItem.create({
      data: maintenancePlanItemCreationDto,
    });
  }

  async searchByTextAndVehicleIdAsync(
    searchText: string,
    page: number,
    pageSize: number,
    vehicleId: number,
  ) {
    const [data, total] = await Promise.all([
      this.prisma.maintenancePlanItem.findMany({
        where: {
          vehicleId: vehicleId,
          maintenanceItem: {
            description: {
              contains: searchText,
              mode: 'insensitive',
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          maintenanceItem: true,
        },
      }),
      this.prisma.maintenancePlanItem.count({
        where: {
          vehicleId: vehicleId,
          maintenanceItem: {
            description: {
              contains: searchText,
              mode: 'insensitive',
            },
          },
        },
      }),
    ]);

    return { data, total };
  }

  async existsAsync(id: number): Promise<boolean> {
    const maintenancePlanItem =
      await this.prisma.maintenancePlanItem.findUnique({
        select: { id: true },
        where: { id },
      });
    return !!maintenancePlanItem;
  }

  async updateMaintenancePlanItemAsync(
    id: number,
    data: UpdateMaintenancePlanItemDto,
  ) {
    return this.prisma.maintenancePlanItem.update({
      where: { id },
      data: { ...data },
    });
  }

  async deleteMaintenancePlanItemAsync(id: number) {
    return this.prisma.maintenancePlanItem.delete({
      where: { id },
    });
  }

  async existsByIdAndVehicleIdAsync(id: number, vehicleId: number) {
    const maintenancePlanItem =
      await this.prisma.maintenancePlanItem.findUnique({
        select: { id: true },
        where: { id, vehicleId },
      });
    return !!maintenancePlanItem;
  }
}
