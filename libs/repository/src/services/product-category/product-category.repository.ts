import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductCategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async existsAsync(id: number): Promise<boolean> {
    const productCategory = await this.prisma.productCategory.findUnique({
      select: { id: true },
      where: { id },
    });
    return !!productCategory;
  }

  async getProductCategoriesAsync() {
    return this.prisma.productCategory.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async createProductCategoryAsync(data: Prisma.ProductCategoryCreateInput) {
    return this.prisma.productCategory.create({
      data,
    });
  }

  async updateProductCategoryAsync(
    id: number,
    data: Prisma.ProductCategoryUpdateInput,
  ) {
    return this.prisma.productCategory.update({
      where: { id },
      data,
    });
  }
}
