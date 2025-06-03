import { Injectable } from '@nestjs/common';
import { Prisma, Stock } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class StockRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createStockAsync(
    data: Prisma.StockCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Stock> {
    const client = tx ?? this.prisma;
    return client.stock.create({
      data,
    });
  }
}
