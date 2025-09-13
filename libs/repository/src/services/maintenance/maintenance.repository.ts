import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';

@Injectable()
export class MaintenanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByVehicleIdAsync(vehicleId: number) {
    return await this.prisma.maintenance.findMany({
      where: {
        maintenancePlanItem: {
          vehicleId: vehicleId,
        },
      },
      include: {
        serviceSupplier: true,
        maintenancePlanItem: {
          include: {
            maintenanceItem: true,
          },
        },
      },
    });
  }

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
}
