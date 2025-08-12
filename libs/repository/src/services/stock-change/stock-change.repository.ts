import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { StockChangeCreationDataDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';

@Injectable()
export class StockChangeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createManyStockChangeAsync(
    changes: StockChangeCreationDataDto[],
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    await client.stockChange.createMany({
      data: changes,
    });
  }
}
