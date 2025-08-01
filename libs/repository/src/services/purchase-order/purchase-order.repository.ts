import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PurchaseOrderStatusId } from '@mp/common/constants';
import { PurchaseOrderDataDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';

@Injectable()
export class PurchaseOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPurchaseOrderAsync(
    data: PurchaseOrderDataDto,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.purchaseOrder.create({ data });
  }

  async findByIdWithSupplierAndStatusAsync(id: number) {
    return this.prisma.purchaseOrder.findUnique({
      where: {
        id,
        purchaseOrderStatusId: { not: PurchaseOrderStatusId.Rejected },
      },
      include: { supplier: true, purchaseOrderStatus: true },
    });
  }

  async existsAsync(id: number): Promise<boolean> {
    const purchaseOrder = await this.prisma.purchaseOrder.findFirst({
      select: { id: true },
      where: {
        AND: [
          { id: id },
          { purchaseOrderStatusId: { not: PurchaseOrderStatusId.Rejected } },
        ],
      },
    });
    return !!purchaseOrder;
  }

  async deletePurchaseOrderAsync(id: number) {
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { purchaseOrderStatusId: PurchaseOrderStatusId.Rejected },
    });
  }
}
