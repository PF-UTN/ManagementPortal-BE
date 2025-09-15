import { Injectable } from '@nestjs/common';

import { MaintenanceCreationDto, UpdateMaintenanceDto } from '@mp/common/dtos';

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

  async updateMaintenanceAsync(id: number, data: UpdateMaintenanceDto) {
    return this.prisma.maintenance.update({
      where: { id },
      data: { ...data },
    });
  }

  async existsAsync(id: number): Promise<boolean> {
    const maintenance = await this.prisma.maintenance.findUnique({
      select: { id: true },
      where: { id },
    });
    return !!maintenance;
  }

  async findByIdAsync(id: number) {
    const maintenance = await this.prisma.maintenance.findUnique({
      where: { id },
    });
    return maintenance;
  }

  async deleteMaintenanceAsync(id: number) {
    return this.prisma.maintenance.delete({
      where: { id },
    });
  }
}
