import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { endOfDay, parseISO } from 'date-fns';

import {
  OrderDirection,
  OrderField,
  OrderStatusId,
} from '@mp/common/constants';

import {
  OrderDataDto,
  SearchOrderFiltersDto,
  SearchOrderFromClientFiltersDto,
} from './../../../../../libs/common/src/dtos';
import { PrismaService } from './../prisma.service';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrderAsync(data: OrderDataDto, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.order.create({ data });
  }

  async searchClientOrdersWithFiltersAsync(
    clientId: number,
    page: number,
    pageSize: number,
    searchText: string,
    filters: SearchOrderFromClientFiltersDto,
    orderBy: {
      field: OrderField.CREATED_AT | OrderField.TOTAL_AMOUNT;
      direction: OrderDirection.ASC | OrderDirection.DESC;
    } = {
      field: OrderField.CREATED_AT,
      direction: OrderDirection.DESC,
    },
  ) {
    const prismaOrderBy =
      orderBy &&
      [OrderField.CREATED_AT, OrderField.TOTAL_AMOUNT].includes(
        orderBy.field,
      ) &&
      [OrderDirection.ASC, OrderDirection.DESC].includes(orderBy.direction)
        ? { [orderBy.field]: orderBy.direction }
        : { createdAt: 'desc' as const };

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          AND: [
            { clientId },
            filters.statusName?.length
              ? { orderStatus: { name: { in: filters.statusName } } }
              : {},
            filters.deliveryMethod?.length
              ? { deliveryMethod: { id: { in: filters.deliveryMethod } } }
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
            {
              OR: [
                {
                  orderStatus: {
                    name: {
                      contains: searchText,
                      mode: 'insensitive',
                    },
                  },
                },
                isNaN(Number(searchText)) ? {} : { id: Number(searchText) },
              ],
            },
          ],
        },
        include: {
          orderStatus: true,
          orderItems: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: prismaOrderBy,
      }),
      this.prisma.order.count({
        where: {
          AND: [
            { clientId },
            filters.statusName?.length
              ? { orderStatus: { name: { in: filters.statusName } } }
              : {},
            filters.deliveryMethod?.length
              ? { deliveryMethod: { id: { in: filters.deliveryMethod } } }
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
            {
              OR: [
                {
                  orderStatus: {
                    name: {
                      contains: searchText,
                      mode: 'insensitive',
                    },
                  },
                },
                isNaN(Number(searchText)) ? {} : { id: Number(searchText) },
              ],
            },
          ],
        },
      }),
    ]);
    return { data, total };
  }

  async findOrderByIdAsync(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        orderStatus: true,
        client: {
          include: { user: true, address: true, taxCategory: true },
        },
        deliveryMethod: true,
        paymentDetail: { include: { paymentType: true } },
      },
    });
  }

  async searchWithFiltersAsync(
    page: number,
    pageSize: number,
    searchText: string,
    filters: SearchOrderFiltersDto,
    orderBy: {
      field: OrderField;
      direction: OrderDirection.ASC | OrderDirection.DESC;
    } = {
      field: OrderField.CREATED_AT,
      direction: OrderDirection.DESC,
    },
  ) {
    const prismaOrderBy =
      orderBy &&
      [OrderField.CREATED_AT].includes(orderBy.field) &&
      [OrderDirection.ASC, OrderDirection.DESC].includes(orderBy.direction)
        ? { [orderBy.field]: orderBy.direction }
        : { createdAt: 'desc' as const };

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          AND: [
            filters.statusName?.length
              ? { orderStatus: { name: { in: filters.statusName } } }
              : {},
            filters.fromCreatedAtDate
              ? { createdAt: { gte: new Date(filters.fromCreatedAtDate) } }
              : {},
            filters.toCreatedAtDate
              ? {
                  createdAt: {
                    lte: endOfDay(parseISO(filters.toCreatedAtDate)),
                  },
                }
              : {},
            {
              OR: [
                {
                  client: {
                    companyName: {
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
          client: {
            select: {
              id: true,
              companyName: true,
            },
          },
          orderStatus: {
            select: {
              name: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: prismaOrderBy,
      }),
      this.prisma.order.count({
        where: {
          AND: [
            filters.statusName?.length
              ? { orderStatus: { name: { in: filters.statusName } } }
              : {},
            filters.fromCreatedAtDate
              ? { createdAt: { gte: new Date(filters.fromCreatedAtDate) } }
              : {},
            filters.toCreatedAtDate
              ? {
                  createdAt: {
                    lte: endOfDay(parseISO(filters.toCreatedAtDate)),
                  },
                }
              : {},
            {
              OR: [
                {
                  client: {
                    companyName: {
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

  async downloadWithFiltersAsync(
    searchText: string,
    filters: SearchOrderFiltersDto,
    orderBy: {
      field: OrderField;
      direction: OrderDirection.ASC | OrderDirection.DESC;
    } = {
      field: OrderField.CREATED_AT,
      direction: OrderDirection.DESC,
    },
  ) {
    const prismaOrderBy =
      orderBy &&
      [OrderField.CREATED_AT, OrderField.TOTAL_AMOUNT].includes(
        orderBy.field,
      ) &&
      [OrderDirection.ASC, OrderDirection.DESC].includes(orderBy.direction)
        ? { [orderBy.field]: orderBy.direction }
        : { createdAt: 'desc' as const };

    const data = await this.prisma.order.findMany({
      where: {
        AND: [
          filters.statusName?.length
            ? { orderStatus: { name: { in: filters.statusName } } }
            : {},
          filters.fromCreatedAtDate
            ? { createdAt: { gte: new Date(filters.fromCreatedAtDate) } }
            : {},
          filters.toCreatedAtDate
            ? {
                createdAt: {
                  lte: endOfDay(parseISO(filters.toCreatedAtDate)),
                },
              }
            : {},
          {
            OR: [
              {
                client: {
                  companyName: {
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
        client: {
          select: {
            id: true,
            companyName: true,
          },
        },
        orderStatus: {
          select: {
            name: true,
          },
        },
      },
      orderBy: prismaOrderBy,
    });
    return data;
  }

  async existsManyPendingUnassignedAsync(ids: number[]): Promise<boolean> {
    const orders = await this.prisma.order.findMany({
      select: { id: true },
      where: {
        AND: [
          { id: { in: ids } },
          { orderStatusId: OrderStatusId.Pending },
          { shipmentId: null },
        ],
      },
    });
    return orders.length === ids.length;
  }

  async updateManyOrderStatusAsync(
    ids: number[],
    newStatus: OrderStatusId,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const client = tx ?? this.prisma;

    const result = await client.order.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        orderStatusId: newStatus,
      },
    });

    return result.count;
  }

  async findOrdersByShipmentIdAsync(shipmentId: number) {
    return this.prisma.order.findMany({
      where: {
        shipmentId,
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });
  }
}
