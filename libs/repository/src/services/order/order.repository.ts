import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';
import { OrderDataDto } from './../../../../../libs/common/src/dtos';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrderAsync(data: OrderDataDto, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.order.create({ data });
  }
}
