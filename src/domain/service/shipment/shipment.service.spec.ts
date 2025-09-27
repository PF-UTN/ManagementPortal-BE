import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, Shipment } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { OrderStatusId, ShipmentStatusId } from '@mp/common/constants';
import { ShipmentCreationDataDto, ShipmentCreationDto } from '@mp/common/dtos';
import { MailingService } from '@mp/common/services';
import {
  ShipmentRepository,
  OrderRepository,
  VehicleRepository,
  PrismaUnitOfWork,
} from '@mp/repository';

import { ShipmentService } from './shipment.service';

describe('ShipmentService', () => {
  let service: ShipmentService;
  let repository: ShipmentRepository;
  let vehicleRepository: VehicleRepository;
  let orderRepository: OrderRepository;
  let mailingService: MailingService;
  let unitOfWork: PrismaUnitOfWork;
  let shipment: ReturnType<typeof mockDeep<Shipment>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentService,
        {
          provide: ShipmentRepository,
          useValue: mockDeep(ShipmentRepository),
        },
        {
          provide: VehicleRepository,
          useValue: mockDeep(VehicleRepository),
        },
        {
          provide: OrderRepository,
          useValue: mockDeep(OrderRepository),
        },
        {
          provide: MailingService,
          useValue: mockDeep(MailingService),
        },
        {
          provide: PrismaUnitOfWork,
          useValue: mockDeep(PrismaUnitOfWork),
        },
      ],
    }).compile();

    repository = module.get<ShipmentRepository>(ShipmentRepository);
    vehicleRepository = module.get<VehicleRepository>(VehicleRepository);
    orderRepository = module.get<OrderRepository>(OrderRepository);
    mailingService = module.get<MailingService>(MailingService);
    unitOfWork = module.get<PrismaUnitOfWork>(PrismaUnitOfWork);

    service = module.get<ShipmentService>(ShipmentService);

    shipment = mockDeep<Shipment>();

    shipment.id = 1;
    shipment.date = mockDeep<Date>(new Date('2025-01-15'));
    shipment.vehicleId = 1;
    shipment.statusId = 1;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createShipmentAsync', () => {
    it('should throw NotFoundException if vehicle does not exist', async () => {
      // Arrange
      const shipmentCreationDtoMock: ShipmentCreationDto = {
        date: shipment.date,
        vehicleId: shipment.vehicleId,
        orderIds: [1, 2, 3],
      };

      jest.spyOn(vehicleRepository, 'existsAsync').mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.createShipmentAsync(shipmentCreationDtoMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if not all orders exist with Pending status', async () => {
      // Arrange
      const shipmentCreationDtoMock: ShipmentCreationDto = {
        date: shipment.date,
        vehicleId: shipment.vehicleId,
        orderIds: [1, 2, 3],
      };

      jest.spyOn(vehicleRepository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(orderRepository, 'existsManyPendingUnassignedAsync')
        .mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.createShipmentAsync(shipmentCreationDtoMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('should call orderRepository.updateManyOrderStatusAsync with the correct data', async () => {
      // Arrange
      const shipmentCreationDtoMock: ShipmentCreationDto = {
        date: shipment.date,
        vehicleId: shipment.vehicleId,
        orderIds: [1, 2, 3],
      };

      jest.spyOn(vehicleRepository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(orderRepository, 'existsManyPendingUnassignedAsync')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(repository, 'createShipmentAsync')
        .mockResolvedValueOnce(shipment);
      jest
        .spyOn(service, 'sendShipmentOrdersStatusEmail')
        .mockResolvedValueOnce();

      const txMock = {} as Prisma.TransactionClient;
      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      // Act
      await service.createShipmentAsync(shipmentCreationDtoMock);

      // Assert
      expect(orderRepository.updateManyOrderStatusAsync).toHaveBeenCalledWith(
        shipmentCreationDtoMock.orderIds,
        OrderStatusId.InPreparation,
        txMock,
      );
    });

    it('should call repository.createShipmentAsync with the correct data', async () => {
      // Arrange
      const shipmentCreationDtoMock: ShipmentCreationDto = {
        date: shipment.date,
        vehicleId: shipment.vehicleId,
        orderIds: [1, 2, 3],
      };

      const shipmentCreationDataDtoMock: ShipmentCreationDataDto = {
        date: shipmentCreationDtoMock.date,
        statusId: ShipmentStatusId.Pending,
        vehicleId: shipmentCreationDtoMock.vehicleId,
        orderIds: shipmentCreationDtoMock.orderIds,
      };

      jest.spyOn(vehicleRepository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(orderRepository, 'existsManyPendingUnassignedAsync')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(repository, 'createShipmentAsync')
        .mockResolvedValueOnce(shipment);
      jest
        .spyOn(service, 'sendShipmentOrdersStatusEmail')
        .mockResolvedValueOnce();
      const txMock = {} as Prisma.TransactionClient;
      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      // Act
      await service.createShipmentAsync(shipmentCreationDtoMock);

      // Assert
      expect(repository.createShipmentAsync).toHaveBeenCalledWith(
        shipmentCreationDataDtoMock,
        txMock,
      );
    });
  });

  describe('sendShipmentOrdersStatusEmail', () => {
    it('should call mailingService.sendMailAsync for each order', async () => {
      // Arrange
      const orders = [
        { id: 1, client: { user: { email: 'cliente1@test.com' } } },
        { id: 2, client: { user: { email: 'cliente2@test.com' } } },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any;

      jest.spyOn(mailingService, 'sendMailAsync').mockResolvedValueOnce({});

      // Act
      await service.sendShipmentOrdersStatusEmail(orders);

      // Assert
      expect(mailingService.sendMailAsync).toHaveBeenCalledTimes(2);

      expect(mailingService.sendMailAsync).toHaveBeenNthCalledWith(
        1,
        'cliente1@test.com',
        'Actualización de estado de su pedido',
        'Su pedido #1 se encuentra en preparación.',
      );

      expect(mailingService.sendMailAsync).toHaveBeenNthCalledWith(
        2,
        'cliente2@test.com',
        'Actualización de estado de su pedido',
        'Su pedido #2 se encuentra en preparación.',
      );
    });
  });
});
