import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { endOfDay, parseISO } from 'date-fns';

import {
  OrderDirection,
  PurchaseOrderField,
  PurchaseOrderStatusId,
} from '@mp/common/constants';
import {
  SearchPurchaseOrderFiltersDto,
  PurchaseOrderDataDto,
} from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';

@Injectable()
export class PurchaseOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async searchWithFiltersAsync(
    page: number,
    pageSize: number,
    searchText: string,
    filters: SearchPurchaseOrderFiltersDto,
    orderBy: {
      field: PurchaseOrderField.CREATED_AT | PurchaseOrderField.TOTAL_AMOUNT;
      direction: OrderDirection.ASC | OrderDirection.DESC;
    } = {
      field: PurchaseOrderField.CREATED_AT,
      direction: OrderDirection.DESC,
    },
  ) {
    const prismaOrderBy =
      orderBy &&
      [PurchaseOrderField.CREATED_AT, PurchaseOrderField.TOTAL_AMOUNT].includes(
        orderBy.field,
      ) &&
      [OrderDirection.ASC, OrderDirection.DESC].includes(orderBy.direction)
        ? { [orderBy.field]: orderBy.direction }
        : { createdAt: 'desc' as const };

    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where: {
          NOT: {
            purchaseOrderStatus: {
              name: 'Deleted',
            },
          },
          AND: [
            filters.statusName?.length
              ? { purchaseOrderStatus: { name: { in: filters.statusName } } }
              : {},
            filters.supplierBusinessName?.length
              ? {
                  supplier: {
                    businessName: { in: filters.supplierBusinessName },
                  },
                }
              : {},
            filters.fromDate
              ? { createdAt: { gte: new Date(filters.fromDate) } }
              : {},
            filters.toDate
              ? {
                  createdAt: {
                    lte: endOfDay(parseISO(filters.toDate)),
                  },
                }
              : {},
            filters.fromEstimatedDeliveryDate
              ? {
                  estimatedDeliveryDate: {
                    gte: new Date(filters.fromEstimatedDeliveryDate),
                  },
                }
              : {},
            filters.toEstimatedDeliveryDate
              ? {
                  estimatedDeliveryDate: {
                    lte: endOfDay(parseISO(filters.toEstimatedDeliveryDate)),
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
                {
                  purchaseOrderStatus: {
                    name: {
                      contains: searchText,
                      mode: 'insensitive',
                    },
                  },
                },
                isNaN(Number(searchText))
                  ? {}
                  : {
                      id: Number(searchText),
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
        orderBy: prismaOrderBy,
      }),
      this.prisma.purchaseOrder.count({
        where: {
          NOT: {
            purchaseOrderStatus: {
              name: 'Deleted',
            },
          },
          AND: [
            filters.statusName?.length
              ? { purchaseOrderStatus: { name: { in: filters.statusName } } }
              : {},
            filters.supplierBusinessName?.length
              ? {
                  supplier: {
                    businessName: { in: filters.supplierBusinessName },
                  },
                }
              : {},
            filters.fromDate
              ? { createdAt: { gte: new Date(filters.fromDate) } }
              : {},
            filters.toDate
              ? {
                  createdAt: {
                    lte: endOfDay(parseISO(filters.toDate)),
                  },
                }
              : {},
            filters.fromEstimatedDeliveryDate
              ? {
                  estimatedDeliveryDate: {
                    gte: new Date(filters.fromEstimatedDeliveryDate),
                  },
                }
              : {},
            filters.toEstimatedDeliveryDate
              ? {
                  estimatedDeliveryDate: {
                    lte: endOfDay(parseISO(filters.toEstimatedDeliveryDate)),
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
                {
                  purchaseOrderStatus: {
                    name: {
                      contains: searchText,
                      mode: 'insensitive',
                    },
                  },
                },
                isNaN(Number(searchText))
                  ? {}
                  : {
                      id: Number(searchText),
                    },
              ],
            },
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

  async findByIdWithSupplierAndStatusAsync(id: number) {
    return this.prisma.purchaseOrder.findUnique({
      where: {
        id,
        purchaseOrderStatusId: { not: PurchaseOrderStatusId.Deleted },
      },
      include: { supplier: true, purchaseOrderStatus: true },
    });
  }

  async findByIdAsync(id: number) {
    return this.prisma.purchaseOrder.findUnique({
      where: {
        id,
        purchaseOrderStatusId: { not: PurchaseOrderStatusId.Deleted },
      },
      include: {
        purchaseOrderItems: {
          select: {
            quantity: true,
            productId: true,
          },
        },
      },
    });
  }

  async existsAsync(id: number): Promise<boolean> {
    const purchaseOrder = await this.prisma.purchaseOrder.findFirst({
      select: { id: true },
      where: {
        AND: [
          { id: id },
          { purchaseOrderStatusId: { not: PurchaseOrderStatusId.Deleted } },
        ],
      },
    });
    return !!purchaseOrder;
  }

  async deletePurchaseOrderAsync(id: number) {
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { purchaseOrderStatusId: PurchaseOrderStatusId.Deleted },
    });
  }

  async updatePurchaseOrderAsync(
    id: number,
    data: Prisma.PurchaseOrderUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.purchaseOrder.update({
      where: { id },
      data,
    });
  }
}
