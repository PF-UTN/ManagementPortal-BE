import { Injectable } from '@nestjs/common';

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
}
