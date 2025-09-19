import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class OrderItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createManyOrderItemAsync(
    data: Prisma.OrderItemCreateManyInput[],
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.orderItem.createMany({ data });
  }
}
