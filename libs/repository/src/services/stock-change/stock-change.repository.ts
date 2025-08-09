import { Injectable } from '@nestjs/common';
import { Prisma, StockChange } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class StockChangeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createManyStockChangeAsync(
    changes: Omit<StockChange, 'id'>[],
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    await client.stockChange.createMany({
      data: changes,
    });
  }
}
