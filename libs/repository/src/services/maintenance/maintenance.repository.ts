import { Injectable } from '@nestjs/common';

import { MaintenanceCreationDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';

@Injectable()
export class MaintenanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async searchByTextAndVehicleIdAsync(
    searchText: string,
    page: number,
    pageSize: number,
    vehicleId: number,
  ) {
    const [data, total] = await Promise.all([
      this.prisma.maintenance.findMany({
        where: {
          maintenancePlanItem: {
            vehicleId: vehicleId,
            maintenanceItem: {
              description: {
                contains: searchText,
                mode: 'insensitive',
              },
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          maintenancePlanItem: {
            include: {
              maintenanceItem: true,
            },
          },
        },
      }),
      this.prisma.maintenance.count({
        where: {
          maintenancePlanItem: {
            vehicleId: vehicleId,
            maintenanceItem: {
              description: {
                contains: searchText,
                mode: 'insensitive',
              },
            },
          },
        },
      }),
    ]);

    return { data, total };
  }

  async existsByMaintenancePlanItemIdAsync(
    maintenancePlanItemId: number,
  ): Promise<boolean> {
    const count = await this.prisma.maintenance.count({
      where: {
        maintenancePlanItemId: maintenancePlanItemId,
      },
    });

    return count > 0;
  }

  async createMaintenanceAsync(data: MaintenanceCreationDto) {
    return this.prisma.maintenance.create({
      data,
    });
  }
}
