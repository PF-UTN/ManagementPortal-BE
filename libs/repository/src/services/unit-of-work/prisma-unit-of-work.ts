import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';
import { IUnitOfWork } from './unit-of-work.interface';

@Injectable()
export class PrismaUnitOfWork implements IUnitOfWork {
  constructor(private readonly prismaService: PrismaService) {}

  async execute<T>(
    work: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prismaService.$transaction((tx) => work(tx), {
      timeout: 20000,
    });
  }
}
