import { Injectable } from '@nestjs/common';

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
}
