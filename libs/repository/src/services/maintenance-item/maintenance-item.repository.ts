import { Injectable } from '@nestjs/common';

import {
  MaintenanceItemCreationDto,
  UpdateMaintenanceItemDto,
} from '@mp/common/dtos';

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

  async searchByTextAsync(searchText: string, page: number, pageSize: number) {
    const [data, total] = await Promise.all([
      this.prisma.maintenanceItem.findMany({
        where: { description: { contains: searchText, mode: 'insensitive' } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          description: 'asc',
        },
      }),
      this.prisma.maintenanceItem.count({
        where: { description: { contains: searchText, mode: 'insensitive' } },
      }),
    ]);

    return { data, total };
  }

  async updateMaintenanceItemAsync(id: number, data: UpdateMaintenanceItemDto) {
    return this.prisma.maintenanceItem.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }
}
