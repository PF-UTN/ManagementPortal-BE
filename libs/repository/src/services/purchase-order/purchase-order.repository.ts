import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SearchPurchaseOrderFiltersDto } from 'libs/common/src/dtos/purchase-order/search-purchase-order-filters.dto';

import { PurchaseOrderDataDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';

@Injectable()
export class PurchaseOrderRepository {
  constructor(private readonly prisma: PrismaService) { }

  async searchWithFiltersAsync(
    page: number,
    pageSize: number,
    searchText: string,
    filters: SearchPurchaseOrderFiltersDto,
  ) {
    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where: {
          AND: [
            filters.statusId?.length
              ? { purchaseOrderStatusId: { in: filters.statusId } }
              : {},
            filters.fromDate
              ? { createdAt: { gte: new Date(filters.fromDate) } }
              : {},
            filters.toDate
              ? { createdAt: { lte: new Date(filters.toDate) } }
              : {},
            filters.fromDeliveryDate
              ? {
                effectiveDeliveryDate: {
                  gte: new Date(filters.fromDeliveryDate),
                },
              }
              : {},
            filters.toDeliveryDate
              ? {
                effectiveDeliveryDate: {
                  lte: new Date(filters.toDeliveryDate),
                },
              }
              : {},
            {
              OR: [
                {
                  supplier: {
                    businessName: {
                      contains: searchText,
                      mode: 'insensitive',
                    },
                  },
                },
              ],
            },
          ],
        },
        include: {
          purchaseOrderStatus: {
            select: {
              id: true,
              name: true,
            },
          },
          supplier: {
            select: {
              id: true,
              businessName: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.purchaseOrder.count({
        where: {
          AND: [
            filters.statusId?.length
              ? { purchaseOrderStatusId: { in: filters.statusId } }
              : {},
            filters.fromDate
              ? { createdAt: { gte: new Date(filters.fromDate) } }
              : {},
            filters.toDate
              ? { createdAt: { lte: new Date(filters.toDate) } }
              : {},
            filters.fromDeliveryDate
              ? {
                effectiveDeliveryDate: {
                  gte: new Date(filters.fromDeliveryDate),
                },
              }
              : {},
            filters.toDeliveryDate
              ? {
                effectiveDeliveryDate: {
                  lte: new Date(filters.toDeliveryDate),
                },
              }
              : {},
            {
              OR: [
                {
                  supplier: {
                    businessName: {
                      contains: searchText,
                      mode: 'insensitive',
                    },
                  },
                },
              ],
            }
          ],
        },
      }),
    ]);
    return { data, total };
  }

  async createPurchaseOrderAsync(
    data: PurchaseOrderDataDto,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.purchaseOrder.create({ data });
  }
}
