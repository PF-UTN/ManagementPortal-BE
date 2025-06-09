import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';

@Injectable()
export class SupplierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async existsAsync(id: number): Promise<boolean> {
    const supplier = await this.prisma.supplier.findUnique({
      select: { id: true },
      where: { id },
    });
    return !!supplier;
  }

  async getAllSuppliersAsync() {
    return this.prisma.supplier.findMany({ orderBy: { businessName: 'asc' } });
  }
}
