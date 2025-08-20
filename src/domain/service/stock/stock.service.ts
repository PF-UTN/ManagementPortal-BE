import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Stock } from '@prisma/client';

import { StockDto } from '@mp/common/dtos';
import { StockRepository } from '@mp/repository';

@Injectable()
export class StockService {
  constructor(private readonly stockRepository: StockRepository) {}

  async findByProductIdAsync(productId: number, tx?: Prisma.TransactionClient): Promise<Stock | null> {
    return this.stockRepository.findByProductIdAsync(productId, tx);
  }

  async updateStockByProductIdAsync(
    productId: number,
    stockDto: StockDto,
    tx?: Prisma.TransactionClient,
  ) {
    const stock = await this.stockRepository.findByProductIdAsync(productId);

    if (!stock) {
      throw new NotFoundException(
        `Stock for product with ID ${productId} not found.`,
      );
    }

    await this.stockRepository.updateStockAsync(stock.id, stockDto, tx);
  }
}
