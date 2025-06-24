import { Injectable } from '@nestjs/common';
import { Prisma, Supplier } from '@prisma/client';

import { SupplierCreationDataDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';

@Injectable()
export class SupplierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async existsAsync(id: number): Promise<boolean> {
    const supplier = await this.prisma.supplier.findUnique({
      select: { id: true },
      where: { id },
    });
    return !!supplier;
  }

  async findByDocumentAsync(documentType: string, documentNumber: string) {
    return await this.prisma.supplier.findFirst({
      where: {
        documentType,
        documentNumber,
      },
      include: {
        address: {
          include: { town: true },
        },
      },
    });
  }

  async findByEmailAsync(email: string) {
    return await this.prisma.supplier.findUnique({
      select: { id: true },
      where: { email },
    });
  }

  async getAllSuppliersAsync() {
    return this.prisma.supplier.findMany({ orderBy: { businessName: 'asc' } });
  }

  async createSupplierAsync(
    data: SupplierCreationDataDto,
    tx?: Prisma.TransactionClient,
  ): Promise<Supplier> {
    const { addressId, ...supplierData } = data;
    const client = tx ?? this.prisma;
    return client.supplier.create({
      data: {
        ...supplierData,
        address: {
          connect: { id: addressId },
        },
      },
    });
  }

  async updateSupplierAsync(
    id: number,
    data: SupplierCreationDataDto,
    tx?: Prisma.TransactionClient,
  ): Promise<Supplier> {
    const { addressId, ...supplierData } = data;
    const client = tx ?? this.prisma;
    return client.supplier.update({
      where: { id },
      data: {
        ...supplierData,
        address: {
          connect: { id: addressId },
        },
      },
    });
  }
}
