import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { OrderDataDto } from './../../../../../libs/common/src/dtos';
import { PrismaService } from './../prisma.service';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrderAsync(data: OrderDataDto, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.order.create({ data });
  }
  async findOrderByIdAsync(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
        orderStatus: true,
        client: true,
        deliveryMethod: true,
        paymentDetail: true,
      },
    });
  }
}
