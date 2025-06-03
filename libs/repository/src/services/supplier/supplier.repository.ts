import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';

@Injectable()
export class SupplierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async checkIfExistsByIdAsync(id: number): Promise<boolean> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });
    return !!supplier;
  }
}
