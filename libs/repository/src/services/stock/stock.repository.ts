import { Injectable } from '@nestjs/common';
import { Prisma, Stock } from '@prisma/client';

import { StockCreationDataDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';

@Injectable()
export class StockRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createStockAsync(
    data: StockCreationDataDto,
    tx?: Prisma.TransactionClient,
  ): Promise<Stock> {
    const { productId, ...stockData } = data;
    const client = tx ?? this.prisma;
    return client.stock.create({
      data: {
        ...stockData,
        product: {
          connect: { id: productId },
        },
      },
    });
  }

  async findByProductIdAsync(productId: number): Promise<Stock | null> {
    return this.prisma.stock.findUnique({
      where: { productId },
    });
  }

  async updateStockAsync(
    productId: number,
    data: Partial<Stock>,
    tx?: Prisma.TransactionClient,
  ): Promise<Stock> {
    const client = tx ?? this.prisma;
    return client.stock.update({
      where: { productId },
      data,
    });
  }
}
