import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';
import { ClientCreationDto } from '@mp/common/dtos';

@Injectable()
export class ClientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createClientAsync(
    data: ClientCreationDto,
    tx?: Prisma.TransactionClient,
  ) {
    const { userId, taxCategoryId, addressId, ...clientData } = data;
    const client = tx ?? this.prisma;
    return client.client.create({
      data: {
        ...clientData,
        user: {
          connect: { id: userId },
        },
        taxCategory: {
          connect: { id: taxCategoryId },
        },
        address: {
          connect: { id: addressId },
        },
      },
      include: {
        taxCategory: true,
      },
    });
  }
}
