import { Injectable } from '@nestjs/common';
import { Order, Prisma } from '@prisma/client';
import { endOfDay, parseISO } from 'date-fns';

import { OrderDirection, OrderField } from '@mp/common/constants';

import {
  OrderDataDto,
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
        orderItems: true,
        orderStatus: true,
        client: {
          include: { user: true, address: true, taxCategory: true },
        },
        deliveryMethod: true,
        paymentDetail: { include: { paymentType: true } },
      },
    });
  }
  async updateOrderAsync(
    id: number,
    data: Prisma.OrderUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Order> {
    const prismaClient = tx ?? this.prisma;
    return prismaClient.order.update({
      where: { id },
      data,
    });
  }
}
