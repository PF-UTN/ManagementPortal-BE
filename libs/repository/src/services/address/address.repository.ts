import { Injectable } from '@nestjs/common';
import { Prisma, Address } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class AddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createAddressAsync(
    data: Prisma.AddressCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Address> {
    const client = tx ?? this.prisma;
    return client.address.create({
      data,
    });
  }
}