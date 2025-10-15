import { Injectable } from '@nestjs/common';
import { Prisma, Shipment } from '@prisma/client';
import { endOfDay, parseISO } from 'date-fns';

import {
  SearchShipmentFiltersDto,
  ShipmentCreationDataDto,
} from '@mp/common/dtos';

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
                address: {
                  include: {
                    town: {
                      include: {
                        province: {
                          include: {
                            country: true,
                          },
                        },
                      },
                    },
                  },
                },
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
            orderStatus: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        vehicle: {
          select: {
            id: true,
            licensePlate: true,
            brand: true,
            model: true,
            kmTraveled: true,
          },
        },
        status: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return shipment;
  }

  async updateShipmentAsync(
    id: number,
    data: Prisma.ShipmentUncheckedUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.shipment.update({
      where: { id },
      data,
    });
  }

  async searchWithFiltersAsync(
    page: number,
    pageSize: number,
    searchText: string,
    filters: SearchShipmentFiltersDto,
  ) {
    const [data, total] = await Promise.all([
      this.prisma.shipment.findMany({
        where: {
          AND: [
            filters.statusName?.length
              ? { status: { name: { in: filters.statusName } } }
              : {},
            filters.vehicleId ? { vehicleId: filters.vehicleId } : {},
            filters.fromDate
              ? { date: { gte: new Date(filters.fromDate) } }
              : {},
            filters.toDate
              ? {
                  date: {
                    lte: endOfDay(parseISO(filters.toDate)),
                  },
                }
              : {},
            {
              OR: [
                {
                  vehicle: {
                    licensePlate: {
                      contains: searchText,
                      mode: 'insensitive',
                    },
                    brand: {
                      contains: searchText,
                      mode: 'insensitive',
                    },
                    model: {
                      contains: searchText,
                      mode: 'insensitive',
                    },
                  },
                },
                isNaN(Number(searchText))
                  ? {}
                  : { orders: { some: { id: Number(searchText) } } },
                isNaN(Number(searchText))
                  ? {}
                  : {
                      id: Number(searchText),
                    },
              ],
            },
          ],
        },
        include: {
          vehicle: {
            select: {
              id: true,
              licensePlate: true,
              brand: true,
              model: true,
            },
          },
          status: {
            select: {
              id: true,
              name: true,
            },
          },
          orders: {
            select: {
              id: true,
              orderStatus: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          date: 'desc',
        },
      }),
      this.prisma.shipment.count({
        where: {
          AND: [
            filters.statusName?.length
              ? { status: { name: { in: filters.statusName } } }
              : {},
            filters.vehicleId ? { vehicleId: filters.vehicleId } : {},
            filters.fromDate
              ? { date: { gte: new Date(filters.fromDate) } }
              : {},
            filters.toDate
              ? {
                  date: {
                    lte: endOfDay(parseISO(filters.toDate)),
                  },
                }
              : {},
            {
              OR: [
                {
                  vehicle: {
                    licensePlate: {
                      contains: searchText,
                      mode: 'insensitive',
                    },
                    brand: {
                      contains: searchText,
                      mode: 'insensitive',
                    },
                    model: {
                      contains: searchText,
                      mode: 'insensitive',
                    },
                  },
                },
                isNaN(Number(searchText))
                  ? {}
                  : { orders: { some: { id: Number(searchText) } } },
                isNaN(Number(searchText))
                  ? {}
                  : {
                      id: Number(searchText),
                    },
              ],
            },
          ],
        },
      }),
    ]);
    return { data, total };
  }

  async downloadWithFiltersAsync(
    searchText: string,
    filters: SearchShipmentFiltersDto,
  ) {
    const data = await this.prisma.shipment.findMany({
      where: {
        AND: [
          filters.statusName?.length
            ? { status: { name: { in: filters.statusName } } }
            : {},
          filters.vehicleId ? { vehicleId: filters.vehicleId } : {},
          filters.fromDate ? { date: { gte: new Date(filters.fromDate) } } : {},
          filters.toDate
            ? {
                date: {
                  lte: endOfDay(parseISO(filters.toDate)),
                },
              }
            : {},
          {
            OR: [
              {
                vehicle: {
                  licensePlate: {
                    contains: searchText,
                    mode: 'insensitive',
                  },
                  brand: {
                    contains: searchText,
                    mode: 'insensitive',
                  },
                  model: {
                    contains: searchText,
                    mode: 'insensitive',
                  },
                },
              },
              isNaN(Number(searchText))
                ? {}
                : { orders: { some: { id: Number(searchText) } } },
              isNaN(Number(searchText))
                ? {}
                : {
                    id: Number(searchText),
                  },
            ],
          },
        ],
      },
      include: {
        vehicle: {
          select: {
            id: true,
            licensePlate: true,
            brand: true,
            model: true,
          },
        },
        status: {
          select: {
            id: true,
            name: true,
          },
        },
        orders: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
    return data;
  }
}
