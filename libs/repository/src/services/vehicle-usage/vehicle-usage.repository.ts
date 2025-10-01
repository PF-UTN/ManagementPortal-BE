import { Injectable } from '@nestjs/common';
import { Prisma, VehicleUsage } from '@prisma/client';

import { VehicleUsageCreationDataDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';

@Injectable()
export class VehicleUsageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createVehicleUsageAsync(
    data: VehicleUsageCreationDataDto,
    tx?: Prisma.TransactionClient,
  ): Promise<VehicleUsage> {
    const { vehicleId, ...vehicleUsageData } = data;
    const client = tx ?? this.prisma;
    return client.vehicleUsage.create({
      data: {
        ...vehicleUsageData,
        vehicle: {
          connect: { id: vehicleId },
        },
      },
    });
  }

  async findLastByVehicleIdAsync(vehicleId: number) {
    const vehicleUsage = await this.prisma.vehicleUsage.findFirst({
      where: { vehicleId },
      orderBy: {
        date: 'desc',
      },
    });
    return vehicleUsage;
  }
}
