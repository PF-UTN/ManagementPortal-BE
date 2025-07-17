import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';

@Injectable()
export class ServiceSupplierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async existsAsync(id: number): Promise<boolean> {
    const serviceSupplier = await this.prisma.serviceSupplier.findUnique({
      select: { id: true },
      where: { id },
    });
    return !!serviceSupplier;
  }
}
