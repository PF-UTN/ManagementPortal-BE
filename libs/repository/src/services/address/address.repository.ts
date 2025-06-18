import { Injectable } from '@nestjs/common';
import { Prisma, Address } from '@prisma/client';

import { AddressCreationDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';

@Injectable()
export class AddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createAddressAsync(
    data: AddressCreationDto,
    tx?: Prisma.TransactionClient,
  ): Promise<Address> {
    const { townId, ...addressData } = data;
    const client = tx ?? this.prisma;
    return client.address.create({
      data: {
        ...addressData,
        town: {
          connect: { id: townId },
        },
      },
    });
  }

  async updateAddressAsync(
    id: number,
    data: AddressCreationDto,
    tx?: Prisma.TransactionClient,
  ): Promise<Address> {
    const { townId, ...addressData } = data;
    const client = tx ?? this.prisma;
    return client.address.update({
      where: { id },
      data: {
        ...addressData,
        town: {
          connect: { id: townId },
        },
      },
    });
  }
}
