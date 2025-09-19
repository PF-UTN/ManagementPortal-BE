import { Injectable } from '@nestjs/common';
import { Prisma, ServiceSupplier } from '@prisma/client';

import { ServiceSupplierCreationDataDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';

@Injectable()
export class ServiceSupplierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async existsAsync(id: number): Promise<boolean> {
    const serviceSupplier = await this.prisma.serviceSupplier.findUnique({
      select: { id: true },
      where: { id },
    });
    return !!serviceSupplier;
  }

  async findByDocumentAsync(documentType: string, documentNumber: string) {
    return await this.prisma.serviceSupplier.findFirst({
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
    return await this.prisma.serviceSupplier.findUnique({
      select: { id: true },
      where: { email },
    });
  }

  async searchByTextAsync(searchText: string, page: number, pageSize: number) {
    const [data, total] = await Promise.all([
      this.prisma.serviceSupplier.findMany({
        select: { id: true, businessName: true },
        where: { businessName: { contains: searchText, mode: 'insensitive' } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          businessName: 'asc',
        },
      }),
      this.prisma.serviceSupplier.count({
        where: { businessName: { contains: searchText, mode: 'insensitive' } },
      }),
    ]);

    return { data, total };
  }

  async createServiceSupplierAsync(
    data: ServiceSupplierCreationDataDto,
    tx?: Prisma.TransactionClient,
  ): Promise<ServiceSupplier> {
    const { addressId, ...serviceSupplierData } = data;
    const client = tx ?? this.prisma;
    return client.serviceSupplier.create({
      data: {
        ...serviceSupplierData,
        address: {
          connect: { id: addressId },
        },
      },
    });
  }

  async updateServiceSupplierAsync(
    id: number,
    data: ServiceSupplierCreationDataDto,
    tx?: Prisma.TransactionClient,
  ): Promise<ServiceSupplier> {
    const { addressId, ...serviceSupplierData } = data;
    const client = tx ?? this.prisma;
    return client.serviceSupplier.update({
      where: { id },
      data: {
        ...serviceSupplierData,
        address: {
          connect: { id: addressId },
        },
      },
    });
  }

  async findByIdAsync(id: number): Promise<ServiceSupplier | null> {
    return this.prisma.serviceSupplier.findUnique({
      where: { id },
      include: {
        address: {
          include: { town: true },
        },
      },
    });
  }
}
