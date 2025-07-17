import { Injectable } from '@nestjs/common';

import { RepairCreationDataDto } from '@mp/common/dtos';

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
}
