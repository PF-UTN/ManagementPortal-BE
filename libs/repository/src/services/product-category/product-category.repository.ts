import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductCategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async checkIfExistsByIdAsync(id: number): Promise<boolean> {
    const productCategory = await this.prisma.productCategory.findUnique({
      where: { id },
    });
    return !!productCategory;
  }
}
