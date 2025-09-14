import { Injectable } from '@nestjs/common';
import { Prisma, Vehicle } from '@prisma/client';

import { UpdateVehicleDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';

@Injectable()
export class VehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async existsByLicensePlateAsync(licensePlate: string): Promise<boolean> {
    const vehicle = await this.prisma.vehicle.findUnique({
      select: { id: true },
      where: { licensePlate },
    });
    return !!vehicle;
  }

  async createVehicleAsync(data: Prisma.VehicleCreateInput) {
    return this.prisma.vehicle.create({
      data,
    });
  }

  async searchByTextAsync(searchText: string, page: number, pageSize: number) {
    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where: {
          AND: [
            { deleted: false },
            {
              OR: [
                { licensePlate: { contains: searchText, mode: 'insensitive' } },
                { brand: { contains: searchText, mode: 'insensitive' } },
                { model: { contains: searchText, mode: 'insensitive' } },
              ],
            },
          ],
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          licensePlate: 'asc',
        },
      }),
      this.prisma.vehicle.count({
        where: {
          AND: [
            { deleted: false },
            {
              OR: [
                { licensePlate: { contains: searchText, mode: 'insensitive' } },
                { brand: { contains: searchText, mode: 'insensitive' } },
                { model: { contains: searchText, mode: 'insensitive' } },
              ],
            },
          ],
        },
      }),
    ]);

    return { data, total };
  }

  downloadBySearchTextAsync(searchText: string) {
    return this.prisma.vehicle.findMany({
      where: {
        AND: [
          { deleted: false },
          {
            OR: [
              { licensePlate: { contains: searchText, mode: 'insensitive' } },
              { brand: { contains: searchText, mode: 'insensitive' } },
              { model: { contains: searchText, mode: 'insensitive' } },
            ],
          },
        ],
      },
      orderBy: {
        licensePlate: 'asc',
      },
    });
  }

  async existsAsync(id: number): Promise<boolean> {
    const vehicle = await this.prisma.vehicle.findFirst({
      select: { id: true },
      where: { AND: [{ id: id }, { deleted: false }] },
    });
    return !!vehicle;
  }

  async deleteVehicleAsync(id: number) {
    return this.prisma.vehicle.update({
      where: { id },
      data: { deleted: true },
    });
  }

  async updateVehicleAsync(id: number, data: UpdateVehicleDto) {
    return this.prisma.vehicle.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }

  async findByIdAsync(id: number): Promise<Vehicle | null> {
    return this.prisma.vehicle.findUnique({
      where: { id, deleted: false },
    });
  }
}
