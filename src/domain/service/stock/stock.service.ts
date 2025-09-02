import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Stock } from '@prisma/client';

import { fieldMap, StockChangeTypeIds } from '@mp/common/constants';
import {
  CreateManyStockChangeDto,
  StockChangeCreationDataDto,
  StockDto,
} from '@mp/common/dtos';
import {
  PrismaUnitOfWork,
  ProductRepository,
  StockChangeRepository,
  StockRepository,
} from '@mp/repository';

@Injectable()
export class StockService {
  constructor(
    private readonly stockRepository: StockRepository,
    private readonly stockChangeRepository: StockChangeRepository,
    private readonly productRepository: ProductRepository,
    private readonly unitOfWork: PrismaUnitOfWork,
  ) {}

  async findByProductIdAsync(
    productId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Stock | null> {
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

  async adjustProductStockAsync(
    createManyStockChangeDto: CreateManyStockChangeDto,
  ) {
    const existsProduct = await this.productRepository.existsAsync(
      createManyStockChangeDto.productId,
    );

    if (!existsProduct) {
      throw new NotFoundException(
        `Product with ID ${createManyStockChangeDto.productId} not found.`,
      );
    }

    const { changes, ...stockChangeData } = createManyStockChangeDto;

    const stock = await this.stockRepository.findByProductIdAsync(
      stockChangeData.productId,
    );

    if (!stock) {
      throw new NotFoundException(
        `Stock for product with ID ${stockChangeData.productId} not found.`,
      );
    }

    const stockUpdates: StockChangeCreationDataDto[] = [];

    const stockUpdateData: Partial<Stock> = {};

    for (const change of changes) {
      const fieldToCheck = fieldMap[change.changedField];
      const currentValue = stock[fieldToCheck];

      if (currentValue !== change.previousValue) {
        throw new BadRequestException(
          `Invalid stock change: expected ${change.previousValue} but found ${currentValue} for ${change.changedField}`,
        );
      }

      stockUpdateData[fieldToCheck] = change.newValue;

      stockUpdates.push({
        ...change,
        productId: stockChangeData.productId,
        changeTypeId: StockChangeTypeIds.Adjustment,
        reason: stockChangeData.reason,
      });
    }

    this.unitOfWork.execute(async (tx) => {
      const updateStockTask = this.stockRepository.updateStockAsync(
        stock.id,
        stockUpdateData,
        tx,
      );
      const createStockChangeTask =
        this.stockChangeRepository.createManyStockChangeAsync(stockUpdates, tx);

      await Promise.all([updateStockTask, createStockChangeTask]);
    });
  }
}
