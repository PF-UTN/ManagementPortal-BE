import { Injectable } from '@nestjs/common';
import { Prisma, Shipment } from '@prisma/client';

import { ShipmentStatusId } from '@mp/common/constants';
import { ShipmentCreationDataDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';

@Injectable()
export class ShipmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createShipmentAsync(
    data: ShipmentCreationDataDto,
    tx?: Prisma.TransactionClient,
  ): Promise<Shipment> {
    const { vehicleId, statusId, orderIds, ...shipmentData } = data;
    const client = tx ?? this.prisma;
    return client.shipment.create({
      data: {
        ...shipmentData,
        vehicle: {
          connect: { id: vehicleId },
        },
        status: {
          connect: { id: statusId },
        },
        orders: {
          connect: orderIds.map((id) => ({ id })),
        },
      },
    });
  }

  async findByIdAsync(id: number) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            client: {
              include: {
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return shipment;
  }

  async updateShipmentStatusAsync(
    id: number,
    newStatus: ShipmentStatusId,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.shipment.update({
      data: {
        statusId: newStatus,
      },
      where: { id },
    });
  }
}
