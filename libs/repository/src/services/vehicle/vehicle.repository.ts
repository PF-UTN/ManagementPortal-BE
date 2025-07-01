import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

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
}
