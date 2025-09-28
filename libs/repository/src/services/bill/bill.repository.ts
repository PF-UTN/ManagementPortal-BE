import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { BillDataDto } from '@mp/common/dtos';

import { PrismaService } from './../prisma.service';

@Injectable()
export class BillRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createBillAsync(data: BillDataDto, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.bill.create({ data });
  }
}
