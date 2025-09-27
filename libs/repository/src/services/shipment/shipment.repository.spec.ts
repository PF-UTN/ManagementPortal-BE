import { Test, TestingModule } from '@nestjs/testing';
import { Shipment } from '@prisma/client';
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
});
