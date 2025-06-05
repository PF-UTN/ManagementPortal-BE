import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';

@Injectable()
export class SupplierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllSuppliersAsync() {
    return this.prisma.supplier.findMany({ orderBy: { businessName: 'asc' } });
  }
}
