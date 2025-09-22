import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ClientCreationDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';

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

  async findClientByIdAsync(clientId: number) {
    return this.prisma.client.findUnique({
      where: { id: clientId },
      include: { taxCategory: true, user: true, address: true },
    });
  }
}
