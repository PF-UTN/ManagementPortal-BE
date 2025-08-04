import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { endOfDay, parseISO } from 'date-fns';

import { OrderDirection, PurchaseOrderField } from '@mp/common/constants';
import { SearchPurchaseOrderFiltersDto } from '@mp/common/dtos';
import { PurchaseOrderDataDto } from '@mp/common/dtos';

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
    } = { field: PurchaseOrderField.CREATED_AT, direction: OrderDirection.DESC },
  ) {
    const prismaOrderBy =
      orderBy &&
      [PurchaseOrderField.CREATED_AT, PurchaseOrderField.TOTAL_AMOUNT].includes(orderBy.field) &&
      [OrderDirection.ASC, OrderDirection.DESC].includes(orderBy.direction)
        ? { [orderBy.field]: orderBy.direction }
        : { createdAt: 'desc' as const };

    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where: {
          NOT: {
            purchaseOrderStatus: {
              name: 'Rejected',
            },
          },
          AND: [
            filters.statusId?.length
              ? { purchaseOrderStatusId: { in: filters.statusId } }
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
            filters.fromEffectiveDeliveryDate
              ? {
                  effectiveDeliveryDate: {
                    gte: new Date(filters.fromEffectiveDeliveryDate),
                  },
                }
              : {},
            filters.toEffectiveDeliveryDate
              ? {
                  effectiveDeliveryDate: {
                    lte: endOfDay(parseISO(filters.toEffectiveDeliveryDate)),
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
              name: 'Rejected',
            },
          },
          AND: [
            filters.statusId?.length
              ? { purchaseOrderStatusId: { in: filters.statusId } }
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
            filters.fromEffectiveDeliveryDate
              ? {
                  effectiveDeliveryDate: {
                    gte: new Date(filters.fromEffectiveDeliveryDate),
                  },
                }
              : {},
            filters.toEffectiveDeliveryDate
              ? {
                  effectiveDeliveryDate: {
                    lte: endOfDay(parseISO(filters.toEffectiveDeliveryDate)),
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
      where: { id },
      include: { supplier: true, purchaseOrderStatus: true },
    });
  }
}
