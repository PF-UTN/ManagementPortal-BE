import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class ClientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createClientAsync(
    data: Prisma.ClientCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.client.create({
      data,
      include: {
        taxCategory: true,
      },
    });
  }
}
