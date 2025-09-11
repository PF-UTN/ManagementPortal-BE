import { Injectable } from '@nestjs/common';

import { RepairCreationDataDto, UpdateRepairDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';

@Injectable()
export class RepairRepository {
  constructor(private readonly prisma: PrismaService) {}

  async existsAsync(id: number): Promise<boolean> {
    const repair = await this.prisma.repair.findFirst({
      select: { id: true },
      where: { AND: [{ id: id }, { deleted: false }] },
    });
    return !!repair;
  }

  async deleteRepairAsync(id: number) {
    return this.prisma.repair.update({
      where: { id },
      data: { deleted: true },
    });
  }

  async createRepairAsync(data: RepairCreationDataDto) {
    return this.prisma.repair.create({
      data: {
        ...data,
        deleted: false,
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
      this.prisma.repair.findMany({
        where: {
          AND: [
            { vehicleId: vehicleId },
            { deleted: false },
            { description: { contains: searchText, mode: 'insensitive' } },
          ],
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.repair.count({
        where: {
          AND: [
            { vehicleId: vehicleId },
            { deleted: false },
            { description: { contains: searchText, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return { data, total };
  }

  async findByVehicleIdAsync(vehicleId: number) {
    return await this.prisma.repair.findMany({
      where: {
        AND: [{ vehicleId: vehicleId }, { deleted: false }],
      },
      include: {
        serviceSupplier: true,
      },
    });
  }

  async updateRepairAsync(id: number, data: UpdateRepairDto) {
    return this.prisma.repair.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }
}
