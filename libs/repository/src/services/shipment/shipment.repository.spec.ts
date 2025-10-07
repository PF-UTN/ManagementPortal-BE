import { Test, TestingModule } from '@nestjs/testing';
import { Shipment } from '@prisma/client';
import { endOfDay, parseISO } from 'date-fns';
import { mockDeep } from 'jest-mock-extended';

import { ShipmentCreationDataDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';
import { ShipmentRepository } from './shipment.repository';

describe('ShipmentRepository', () => {
  let repository: ShipmentRepository;
  let prismaService: PrismaService;
  let shipment: ReturnType<typeof mockDeep<Shipment>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    repository = module.get<ShipmentRepository>(ShipmentRepository);

    shipment = mockDeep<Shipment>();

    shipment.id = 1;
    shipment.date = mockDeep<Date>(new Date('2025-01-15'));
    shipment.vehicleId = 1;
    shipment.statusId = 1;
  });

  describe('createShipmentAsync', () => {
    it('should create a shipment with the provided data', async () => {
      // Arrange
      const shipmentCreationDataDtoMock: ShipmentCreationDataDto = {
        date: shipment.date,
        vehicleId: shipment.vehicleId,
        statusId: shipment.statusId,
        orderIds: [1, 2, 3],
      };
      jest
        .spyOn(prismaService.shipment, 'create')
        .mockResolvedValueOnce(shipment);

      // Act
      const result = await repository.createShipmentAsync(
        shipmentCreationDataDtoMock,
      );

      // Assert
      expect(result).toEqual(shipment);
    });

    it('should call prisma.shipment.create with correct data', async () => {
      // Arrange
      const shipmentCreationDataDtoMock: ShipmentCreationDataDto = {
        date: shipment.date,
        vehicleId: shipment.vehicleId,
        statusId: shipment.statusId,
        orderIds: [1, 2, 3],
      };
      const { vehicleId, statusId, orderIds, ...shipmentData } =
        shipmentCreationDataDtoMock;

      jest
        .spyOn(prismaService.shipment, 'create')
        .mockResolvedValueOnce(shipment);

      // Act
      await repository.createShipmentAsync(shipmentCreationDataDtoMock);

      // Assert
      expect(prismaService.shipment.create).toHaveBeenCalledWith({
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
    });
  });

  describe('findByIdAsync', () => {
    it('should return a shipment if exists', async () => {
      // Arrange
      const id = shipment.id;
      jest
        .spyOn(prismaService.shipment, 'findUnique')
        .mockResolvedValueOnce(shipment);

      // Act
      const foundShipment = await repository.findByIdAsync(id);

      // Assert
      expect(foundShipment).toBe(shipment);
    });

    it('should return null if shipment does not exist', async () => {
      // Arrange
      const id = shipment.id;
      jest
        .spyOn(prismaService.shipment, 'findUnique')
        .mockResolvedValueOnce(null);

      // Act
      const foundShipment = await repository.findByIdAsync(id);

      // Assert
      expect(foundShipment).toBe(null);
    });
  });

  describe('updateShipmentStatusAsync', () => {
    it('should update an existing shipment status', async () => {
      // Arrange
      const shipmentId = shipment.id;
      const newStatus = shipment.statusId;
      const finishedAt = shipment.finishedAt;

      jest
        .spyOn(prismaService.shipment, 'update')
        .mockResolvedValueOnce(shipment);

      // Act
      const updatedShipment = await repository.updateShipmentAsync(shipmentId, {
        statusId: newStatus,
        finishedAt,
      });

      // Assert
      expect(updatedShipment).toEqual(shipment);
    });
  });

  describe('searchWithFiltersAsync', () => {
    const filters = {
      statusName: ['Pending'],
      fromDate: '2023-01-01',
      toDate: '2023-12-31',
    };

    const page = 1;
    const pageSize = 10;
    const searchText = 'Sprinter';

    const mockData = [shipment];
    const mockTotal = 1;

    beforeEach(() => {
      jest
        .spyOn(prismaService.shipment, 'findMany')
        .mockResolvedValue(mockData);
      jest.spyOn(prismaService.shipment, 'count').mockResolvedValue(mockTotal);
    });

    it('should call prisma.shipment.findMany with correct filters, pagination and order', async () => {
      // Act
      await repository.searchWithFiltersAsync(
        page,
        pageSize,
        searchText,
        filters,
      );

      // Assert
      expect(prismaService.shipment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: [
              filters.statusName?.length
                ? { status: { name: { in: filters.statusName } } }
                : {},
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
          }),
          orderBy: { date: 'desc' },
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should call prisma.shipment.count with same filters', async () => {
      // Act
      await repository.searchWithFiltersAsync(
        page,
        pageSize,
        searchText,
        filters,
      );

      // Assert
      expect(prismaService.shipment.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: [
              filters.statusName?.length
                ? { status: { name: { in: filters.statusName } } }
                : {},
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
          }),
        }),
      );
    });

    it('should return data and total from prisma results', async () => {
      // Act
      const result = await repository.searchWithFiltersAsync(
        page,
        pageSize,
        searchText,
        filters,
      );

      // Assert
      expect(result).toEqual({
        data: mockData,
        total: mockTotal,
      });
    });
  });
});
