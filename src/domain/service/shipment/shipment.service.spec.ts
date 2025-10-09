import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, Shipment } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import {
  DeliveryMethodId,
  OrderStatusId,
  orderStatusTranslations,
  ShipmentStatusId,
} from '@mp/common/constants';
import {
  FinishShipmentDto,
  SearchShipmentFiltersDto,
  ShipmentCreationDataDto,
  ShipmentCreationDto,
  VehicleUsageCreationDataDto,
} from '@mp/common/dtos';
import { MailingService } from '@mp/common/services';
import {
  ShipmentRepository,
  OrderRepository,
  VehicleRepository,
  PrismaUnitOfWork,
  VehicleUsageRepository,
} from '@mp/repository';

import { ShipmentService } from './shipment.service';
import { DownloadShipmentQuery } from '../../../controllers/shipment/query/download-shipment.query';
import { SearchShipmentQuery } from '../../../controllers/shipment/query/search-shipment.query';
import { GoogleMapsRoutingService } from '../../../services/google-maps-routing.service';

describe('ShipmentService', () => {
  let service: ShipmentService;
  let repository: ShipmentRepository;
  let vehicleRepository: VehicleRepository;
  let orderRepository: OrderRepository;
  let vehicleUsageRepository: VehicleUsageRepository;
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
          provide: VehicleUsageRepository,
          useValue: mockDeep(VehicleUsageRepository),
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
        {
          provide: GoogleMapsRoutingService,
          useValue: mockDeep(GoogleMapsRoutingService),
        },
      ],
    }).compile();

    repository = module.get<ShipmentRepository>(ShipmentRepository);
    vehicleRepository = module.get<VehicleRepository>(VehicleRepository);
    orderRepository = module.get<OrderRepository>(OrderRepository);
    vehicleUsageRepository = module.get<VehicleUsageRepository>(
      VehicleUsageRepository,
    );
    mailingService = module.get<MailingService>(MailingService);
    unitOfWork = module.get<PrismaUnitOfWork>(PrismaUnitOfWork);

    service = module.get<ShipmentService>(ShipmentService);

    shipment = mockDeep<Shipment>();

    shipment.id = 1;
    shipment.date = mockDeep<Date>(new Date('2025-01-15'));
    shipment.vehicleId = 1;
    shipment.statusId = 1;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
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

  describe('sendShipmentAsync', () => {
    it('should throw NotFoundException if shipment does not exist', async () => {
      // Arrange
      const shipmentId = shipment.id;

      jest.spyOn(repository, 'findByIdAsync').mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.sendShipmentAsync(shipmentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if shipment status is not pending', async () => {
      // Arrange
      const shipmentId = shipment.id;
      const shipmentMock = mockDeep<
        Prisma.ShipmentGetPayload<{
          include: {
            orders: {
              include: {
                client: {
                  include: {
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
              };
            };
            vehicle: {
              select: {
                id: true;
                licensePlate: true;
                brand: true;
                model: true;
              };
            };
            status: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        }>
      >();

      shipmentMock.statusId = ShipmentStatusId.Finished;

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(shipmentMock);

      // Act & Assert
      await expect(service.sendShipmentAsync(shipmentId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if not all orders are with Prepared status', async () => {
      // Arrange
      const shipmentId = shipment.id;
      const shipmentMock = mockDeep<
        Prisma.ShipmentGetPayload<{
          include: {
            orders: {
              include: {
                client: {
                  include: {
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
              };
            };
            vehicle: {
              select: {
                id: true;
                licensePlate: true;
                brand: true;
                model: true;
              };
            };
            status: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        }>
      >();

      shipmentMock.orders[0].orderStatusId = OrderStatusId.Pending;

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(shipmentMock);
      jest
        .spyOn(orderRepository, 'findOrdersByShipmentIdAsync')
        .mockResolvedValueOnce(shipmentMock.orders);

      // Act & Assert
      await expect(service.sendShipmentAsync(shipmentId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if not all orders delivery method is home delivery', async () => {
      // Arrange
      const shipmentId = shipment.id;
      const shipmentMock = mockDeep<
        Prisma.ShipmentGetPayload<{
          include: {
            orders: {
              include: {
                client: {
                  include: {
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
              };
            };
            vehicle: {
              select: {
                id: true;
                licensePlate: true;
                brand: true;
                model: true;
              };
            };
            status: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        }>
      >();

      shipmentMock.orders[0].deliveryMethodId = DeliveryMethodId.PickUpAtStore;

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(shipmentMock);
      jest
        .spyOn(orderRepository, 'findOrdersByShipmentIdAsync')
        .mockResolvedValueOnce(shipmentMock.orders);

      // Act & Assert
      await expect(service.sendShipmentAsync(shipmentId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should call orderRepository.updateManyOrderStatusAsync with the correct data', async () => {
      // Arrange
      const shipmentId = shipment.id;
      const shipmentMock = mockDeep<
        Prisma.ShipmentGetPayload<{
          include: {
            orders: {
              include: {
                client: {
                  include: {
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
              };
            };
            vehicle: {
              select: {
                id: true;
                licensePlate: true;
                brand: true;
                model: true;
              };
            };
            status: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        }>
      >();

      shipmentMock.statusId = ShipmentStatusId.Pending;
      shipmentMock.orders = [
        {
          orderStatusId: OrderStatusId.Prepared,
          client: {
            id: 1,
            companyName: 'test client',
            addressId: 1,
            taxCategoryId: 1,
            user: {
              email: 'test-client@test.com',
            },
            userId: 1,
          },
          clientId: 1,
          createdAt: mockDeep<Date>(new Date('2015-01-15')),
          deliveryMethodId: DeliveryMethodId.HomeDelivery,
          id: 1,
          paymentDetailId: 1,
          shipmentId: shipment.id,
          totalAmount: mockDeep<Prisma.Decimal>(new Prisma.Decimal(200.5)),
        },
      ];

      const orderIds = shipmentMock.orders.map((order) => order.id);

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(shipmentMock);
      jest
        .spyOn(orderRepository, 'findOrdersByShipmentIdAsync')
        .mockResolvedValueOnce(shipmentMock.orders);
      jest
        .spyOn(repository, 'updateShipmentAsync')
        .mockResolvedValueOnce(shipment);
      jest
        .spyOn(service, 'sendShipmentOrdersStatusEmail')
        .mockResolvedValueOnce();

      const txMock = {} as Prisma.TransactionClient;
      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      // Act
      await service.sendShipmentAsync(shipmentId);

      // Assert
      expect(orderRepository.updateManyOrderStatusAsync).toHaveBeenCalledWith(
        orderIds,
        OrderStatusId.Shipped,
        txMock,
      );
    });

    it('should call repository.sendShipmentAsync with the correct data', async () => {
      // Arrange
      const shipmentId = shipment.id;
      const shipmentMock = mockDeep<
        Prisma.ShipmentGetPayload<{
          include: {
            orders: {
              include: {
                client: {
                  include: {
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
              };
            };
            vehicle: {
              select: {
                id: true;
                licensePlate: true;
                brand: true;
                model: true;
              };
            };
            status: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        }>
      >();

      shipmentMock.statusId = ShipmentStatusId.Pending;
      shipmentMock.orders = [
        {
          orderStatusId: OrderStatusId.Prepared,
          client: {
            id: 1,
            companyName: 'test client',
            addressId: 1,
            taxCategoryId: 1,
            user: {
              email: 'test-client@test.com',
            },
            userId: 1,
          },
          clientId: 1,
          createdAt: mockDeep<Date>(new Date('2015-01-15')),
          deliveryMethodId: DeliveryMethodId.HomeDelivery,
          id: 1,
          paymentDetailId: 1,
          shipmentId: shipment.id,
          totalAmount: mockDeep<Prisma.Decimal>(new Prisma.Decimal(200.5)),
        },
      ];

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(shipmentMock);
      jest
        .spyOn(orderRepository, 'findOrdersByShipmentIdAsync')
        .mockResolvedValueOnce(shipmentMock.orders);
      jest
        .spyOn(repository, 'updateShipmentAsync')
        .mockResolvedValueOnce(shipment);
      jest
        .spyOn(service, 'sendShipmentOrdersStatusEmail')
        .mockResolvedValueOnce();

      const txMock = {} as Prisma.TransactionClient;
      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      // Act
      await service.sendShipmentAsync(shipmentId);

      // Assert
      expect(repository.updateShipmentAsync).toHaveBeenCalledWith(
        shipmentId,
        { statusId: ShipmentStatusId.Shipped },
        txMock,
      );
    });
  });

  describe('sendShipmentOrdersStatusEmail', () => {
    it('should call mailingService.sendMailAsync for each order', async () => {
      // Arrange
      const newStatus = OrderStatusId.InPreparation;
      const orders = [
        { id: 1, client: { user: { email: 'cliente1@test.com' } } },
        { id: 2, client: { user: { email: 'cliente2@test.com' } } },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any;

      jest.spyOn(mailingService, 'sendMailAsync').mockResolvedValueOnce({});

      // Act
      await service.sendShipmentOrdersStatusEmail(orders, newStatus);

      // Assert
      expect(mailingService.sendMailAsync).toHaveBeenCalledTimes(2);

      expect(mailingService.sendMailAsync).toHaveBeenNthCalledWith(
        1,
        'cliente1@test.com',
        'Actualización de estado de su pedido',
        `Su pedido #1 se encuentra ${orderStatusTranslations[OrderStatusId[newStatus]]}.`,
      );

      expect(mailingService.sendMailAsync).toHaveBeenNthCalledWith(
        2,
        'cliente2@test.com',
        'Actualización de estado de su pedido',
        `Su pedido #2 se encuentra ${orderStatusTranslations[OrderStatusId[newStatus]]}.`,
      );
    });
  });

  describe('finishShipmentAsync', () => {
    it('should throw NotFoundException if shipment does not exist', async () => {
      // Arrange
      const shipmentId = shipment.id;

      jest.spyOn(repository, 'findByIdAsync').mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.finishShipmentAsync(shipmentId, {} as FinishShipmentDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if shipment status is not shipped', async () => {
      // Arrange
      const shipmentId = shipment.id;
      const shipmentMock = mockDeep<
        Prisma.ShipmentGetPayload<{
          include: {
            orders: {
              include: {
                client: {
                  include: {
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
              };
            };
            vehicle: {
              select: {
                id: true;
                licensePlate: true;
                brand: true;
                model: true;
              };
            };
            status: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        }>
      >();

      shipmentMock.statusId = ShipmentStatusId.Finished;

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(shipmentMock);

      // Act & Assert
      await expect(
        service.finishShipmentAsync(shipmentId, {} as FinishShipmentDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if any order do not belong to shipment', async () => {
      // Arrange
      const shipmentId = shipment.id;
      const shipmentMock = mockDeep<
        Prisma.ShipmentGetPayload<{
          include: {
            orders: {
              include: {
                client: {
                  include: {
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
              };
            };
            vehicle: {
              select: {
                id: true;
                licensePlate: true;
                brand: true;
                model: true;
              };
            };
            status: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        }>
      >();

      shipmentMock.statusId = ShipmentStatusId.Shipped;
      shipmentMock.orders = [
        {
          id: 2,
          createdAt: mockDeep<Date>(new Date('2000-05-15 08:35:23')),
          client: {
            addressId: 1,
            companyName: 'Test Client',
            id: 1,
            taxCategoryId: 1,
            userId: 1,
            user: {
              email: 'client@test.com',
            },
          },
          clientId: 1,
          deliveryMethodId: DeliveryMethodId.HomeDelivery,
          orderStatusId: OrderStatusId.Prepared,
          paymentDetailId: 1,
          shipmentId: 1,
          totalAmount: mockDeep<Prisma.Decimal>(new Prisma.Decimal(250)),
        },
      ];

      const finishShipmentDtoMock: FinishShipmentDto = {
        finishedAt: new Date('2000-05-15 08:35:23'),
        odometer: 120000,
        orders: [
          {
            orderId: 1,
            orderStatusId: 4,
          },
        ],
      };

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(shipmentMock);

      // Act & Assert
      await expect(
        service.finishShipmentAsync(shipmentId, finishShipmentDtoMock),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if any of the orders in the shipment are missing', async () => {
      // Arrange
      const shipmentId = shipment.id;
      const shipmentMock = mockDeep<
        Prisma.ShipmentGetPayload<{
          include: {
            orders: {
              include: {
                client: {
                  include: {
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
              };
            };
            vehicle: {
              select: {
                id: true;
                licensePlate: true;
                brand: true;
                model: true;
              };
            };
            status: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        }>
      >();

      shipmentMock.statusId = ShipmentStatusId.Shipped;
      shipmentMock.orders = [
        {
          id: 2,
          createdAt: mockDeep<Date>(new Date('2000-05-15 08:35:23')),
          client: {
            addressId: 1,
            companyName: 'Test Client',
            id: 1,
            taxCategoryId: 1,
            userId: 1,
            user: {
              email: 'client@test.com',
            },
          },
          clientId: 1,
          deliveryMethodId: DeliveryMethodId.HomeDelivery,
          orderStatusId: OrderStatusId.Prepared,
          paymentDetailId: 1,
          shipmentId: 1,
          totalAmount: mockDeep<Prisma.Decimal>(new Prisma.Decimal(250)),
        },
        {
          id: 4,
          createdAt: mockDeep<Date>(new Date('2000-05-15 08:35:23')),
          client: {
            addressId: 1,
            companyName: 'Test Client',
            id: 1,
            taxCategoryId: 1,
            userId: 1,
            user: {
              email: 'client@test.com',
            },
          },
          clientId: 1,
          deliveryMethodId: DeliveryMethodId.HomeDelivery,
          orderStatusId: OrderStatusId.Prepared,
          paymentDetailId: 1,
          shipmentId: 1,
          totalAmount: mockDeep<Prisma.Decimal>(new Prisma.Decimal(250)),
        },
      ];

      const finishShipmentDtoMock: FinishShipmentDto = {
        finishedAt: new Date('2000-05-15 08:35:23'),
        odometer: 120000,
        orders: [
          {
            orderId: 1,
            orderStatusId: 4,
          },
        ],
      };

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(shipmentMock);

      // Act & Assert
      await expect(
        service.finishShipmentAsync(shipmentId, finishShipmentDtoMock),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if new odometer value is less than the previously registered value', async () => {
      // Arrange
      const shipmentId = shipment.id;
      const shipmentMock = mockDeep<
        Prisma.ShipmentGetPayload<{
          include: {
            orders: {
              include: {
                client: {
                  include: {
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
              };
            };
            vehicle: {
              select: {
                id: true;
                licensePlate: true;
                brand: true;
                model: true;
              };
            };
            status: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        }>
      >();

      shipmentMock.statusId = ShipmentStatusId.Finished;
      shipmentMock.orders = [
        {
          id: 2,
          createdAt: mockDeep<Date>(new Date('2000-05-15 08:35:23')),
          client: {
            addressId: 1,
            companyName: 'Test Client',
            id: 1,
            taxCategoryId: 1,
            userId: 1,
            user: {
              email: 'client@test.com',
            },
          },
          clientId: 1,
          deliveryMethodId: DeliveryMethodId.HomeDelivery,
          orderStatusId: OrderStatusId.Prepared,
          paymentDetailId: 1,
          shipmentId: 1,
          totalAmount: mockDeep<Prisma.Decimal>(new Prisma.Decimal(250)),
        },
      ];

      const finishShipmentDtoMock: FinishShipmentDto = {
        finishedAt: new Date('2000-05-15 10:53:25'),
        odometer: 120000,
        orders: [
          {
            orderId: 1,
            orderStatusId: 4,
          },
        ],
      };

      const lastVehicleUsageMock = {
        id: 1,
        date: new Date('2000-05-10'),
        vehicleId: 1,
        odometer: new Prisma.Decimal(200000),
        kmUsed: new Prisma.Decimal(50),
      };

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(shipmentMock);

      jest
        .spyOn(vehicleUsageRepository, 'findLastByVehicleIdAsync')
        .mockResolvedValueOnce(lastVehicleUsageMock);

      // Act & Assert
      await expect(
        service.finishShipmentAsync(shipmentId, finishShipmentDtoMock),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if finished date is earlier than the last registered usage date', async () => {
      // Arrange
      const shipmentId = shipment.id;
      const shipmentMock = mockDeep<
        Prisma.ShipmentGetPayload<{
          include: {
            orders: {
              include: {
                client: {
                  include: {
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
              };
            };
            vehicle: {
              select: {
                id: true;
                licensePlate: true;
                brand: true;
                model: true;
              };
            };
            status: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        }>
      >();

      shipmentMock.statusId = ShipmentStatusId.Finished;
      shipmentMock.orders = [
        {
          id: 2,
          createdAt: mockDeep<Date>(new Date('2000-05-15 08:35:23')),
          client: {
            addressId: 1,
            companyName: 'Test Client',
            id: 1,
            taxCategoryId: 1,
            userId: 1,
            user: {
              email: 'client@test.com',
            },
          },
          clientId: 1,
          deliveryMethodId: DeliveryMethodId.HomeDelivery,
          orderStatusId: OrderStatusId.Prepared,
          paymentDetailId: 1,
          shipmentId: 1,
          totalAmount: mockDeep<Prisma.Decimal>(new Prisma.Decimal(250)),
        },
      ];

      const finishShipmentDtoMock: FinishShipmentDto = {
        finishedAt: new Date('2000-05-15 10:53:25'),
        odometer: 120000,
        orders: [
          {
            orderId: 1,
            orderStatusId: 4,
          },
        ],
      };

      const lastVehicleUsageMock = {
        id: 1,
        date: new Date('2025-05-15'),
        vehicleId: 1,
        odometer: new Prisma.Decimal(100000),
        kmUsed: new Prisma.Decimal(50),
      };

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(shipmentMock);

      jest
        .spyOn(vehicleUsageRepository, 'findLastByVehicleIdAsync')
        .mockResolvedValueOnce(lastVehicleUsageMock);

      // Act & Assert
      await expect(
        service.finishShipmentAsync(shipmentId, finishShipmentDtoMock),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call orderRepository.updateOrderAsync with the correct data', async () => {
      // Arrange
      const shipmentId = shipment.id;
      const shipmentMock = mockDeep<
        Prisma.ShipmentGetPayload<{
          include: {
            orders: {
              include: {
                client: {
                  include: {
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
              };
            };
            vehicle: {
              select: {
                id: true;
                licensePlate: true;
                brand: true;
                model: true;
              };
            };
            status: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        }>
      >();

      shipmentMock.statusId = ShipmentStatusId.Shipped;
      shipmentMock.orders = [
        {
          id: 2,
          createdAt: mockDeep<Date>(new Date('2000-05-15 08:35:23')),
          client: {
            addressId: 1,
            companyName: 'Test Client',
            id: 1,
            taxCategoryId: 1,
            userId: 1,
            user: {
              email: 'client@test.com',
            },
          },
          clientId: 1,
          deliveryMethodId: DeliveryMethodId.HomeDelivery,
          orderStatusId: OrderStatusId.Finished,
          paymentDetailId: 1,
          shipmentId: 1,
          totalAmount: mockDeep<Prisma.Decimal>(new Prisma.Decimal(250)),
        },
      ];

      const finishShipmentDtoMock: FinishShipmentDto = {
        finishedAt: new Date('2000-05-15 10:53:25'),
        odometer: 120000,
        orders: [
          {
            orderId: 2,
            orderStatusId: 4,
          },
        ],
      };

      const lastVehicleUsageMock = {
        id: 1,
        date: new Date('2000-05-10'),
        vehicleId: 1,
        odometer: new Prisma.Decimal(100000),
        kmUsed: new Prisma.Decimal(50),
      };

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(shipmentMock);

      jest
        .spyOn(vehicleUsageRepository, 'findLastByVehicleIdAsync')
        .mockResolvedValueOnce(lastVehicleUsageMock);

      jest
        .spyOn(orderRepository, 'findOrdersByShipmentIdAsync')
        .mockResolvedValueOnce(shipmentMock.orders);

      const txMock = {} as Prisma.TransactionClient;
      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      // Act
      await service.finishShipmentAsync(shipmentId, finishShipmentDtoMock);

      // Assert
      expect(orderRepository.updateOrderAsync).toHaveBeenCalledWith(
        finishShipmentDtoMock.orders[0].orderId,
        { orderStatusId: OrderStatusId.Finished },
        txMock,
      );
    });

    it('should call repository.updateShipmentAsync with the correct data', async () => {
      // Arrange
      const shipmentId = shipment.id;
      const shipmentMock = mockDeep<
        Prisma.ShipmentGetPayload<{
          include: {
            orders: {
              include: {
                client: {
                  include: {
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
              };
            };
            vehicle: {
              select: {
                id: true;
                licensePlate: true;
                brand: true;
                model: true;
              };
            };
            status: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        }>
      >();

      shipmentMock.statusId = ShipmentStatusId.Shipped;
      shipmentMock.orders = [
        {
          id: 2,
          createdAt: mockDeep<Date>(new Date('2000-05-15 08:35:23')),
          client: {
            addressId: 1,
            companyName: 'Test Client',
            id: 1,
            taxCategoryId: 1,
            userId: 1,
            user: {
              email: 'client@test.com',
            },
          },
          clientId: 1,
          deliveryMethodId: DeliveryMethodId.HomeDelivery,
          orderStatusId: OrderStatusId.Prepared,
          paymentDetailId: 1,
          shipmentId: 1,
          totalAmount: mockDeep<Prisma.Decimal>(new Prisma.Decimal(250)),
        },
      ];

      const finishShipmentDtoMock: FinishShipmentDto = {
        finishedAt: new Date('2000-05-15 10:53:25'),
        odometer: 120000,
        orders: [
          {
            orderId: 2,
            orderStatusId: 4,
          },
        ],
      };

      const lastVehicleUsageMock = {
        id: 1,
        date: new Date('2000-05-10'),
        vehicleId: 1,
        odometer: new Prisma.Decimal(100000),
        kmUsed: new Prisma.Decimal(50),
      };

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(shipmentMock);

      jest
        .spyOn(vehicleUsageRepository, 'findLastByVehicleIdAsync')
        .mockResolvedValueOnce(lastVehicleUsageMock);

      jest
        .spyOn(orderRepository, 'findOrdersByShipmentIdAsync')
        .mockResolvedValueOnce(shipmentMock.orders);

      const txMock = {} as Prisma.TransactionClient;
      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      // Act
      await service.finishShipmentAsync(shipmentId, finishShipmentDtoMock);

      // Assert
      expect(repository.updateShipmentAsync).toHaveBeenCalledWith(
        shipmentId,
        {
          statusId: ShipmentStatusId.Finished,
          finishedAt: finishShipmentDtoMock.finishedAt,
          effectiveKm:
            finishShipmentDtoMock.odometer -
            Number(lastVehicleUsageMock.odometer),
        },
        txMock,
      );
    });

    it('should call vehicleUsageRepository.createVehicleUsageAsync with the correct data', async () => {
      // Arrange
      const shipmentId = shipment.id;
      const shipmentMock = mockDeep<
        Prisma.ShipmentGetPayload<{
          include: {
            orders: {
              include: {
                client: {
                  include: {
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
              };
            };
            vehicle: {
              select: {
                id: true;
                licensePlate: true;
                brand: true;
                model: true;
              };
            };
            status: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        }>
      >();

      shipmentMock.vehicleId = shipment.vehicleId;
      shipmentMock.statusId = ShipmentStatusId.Shipped;
      shipmentMock.orders = [
        {
          id: 2,
          createdAt: mockDeep<Date>(new Date('2000-05-15 08:35:23')),
          client: {
            addressId: 1,
            companyName: 'Test Client',
            id: 1,
            taxCategoryId: 1,
            userId: 1,
            user: {
              email: 'client@test.com',
            },
          },
          clientId: 1,
          deliveryMethodId: DeliveryMethodId.HomeDelivery,
          orderStatusId: OrderStatusId.Prepared,
          paymentDetailId: 1,
          shipmentId: 1,
          totalAmount: mockDeep<Prisma.Decimal>(new Prisma.Decimal(250)),
        },
      ];

      const finishShipmentDtoMock: FinishShipmentDto = {
        finishedAt: new Date('2000-05-15 10:53:25'),
        odometer: 120000,
        orders: [
          {
            orderId: 2,
            orderStatusId: 4,
          },
        ],
      };

      const lastVehicleUsageMock = {
        id: 1,
        date: new Date('2000-05-10'),
        vehicleId: 1,
        odometer: new Prisma.Decimal(100000),
        kmUsed: new Prisma.Decimal(50),
      };

      const vehicleUsageCreationDataDtoMock: VehicleUsageCreationDataDto = {
        date: finishShipmentDtoMock.finishedAt,
        vehicleId: shipment.vehicleId,
        odometer: finishShipmentDtoMock.odometer,
        kmUsed:
          finishShipmentDtoMock.odometer -
          Number(lastVehicleUsageMock.odometer),
      };

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(shipmentMock);

      jest
        .spyOn(vehicleUsageRepository, 'findLastByVehicleIdAsync')
        .mockResolvedValueOnce(lastVehicleUsageMock);

      jest
        .spyOn(orderRepository, 'findOrdersByShipmentIdAsync')
        .mockResolvedValueOnce(shipmentMock.orders);

      const txMock = {} as Prisma.TransactionClient;
      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      // Act
      await service.finishShipmentAsync(shipmentId, finishShipmentDtoMock);

      // Assert
      expect(
        vehicleUsageRepository.createVehicleUsageAsync,
      ).toHaveBeenCalledWith(vehicleUsageCreationDataDtoMock, txMock);
    });

    it('should call vehicleRepository.updateVehicleKmTraveledAsync with the correct data', async () => {
      // Arrange
      const shipmentId = shipment.id;
      const shipmentMock = mockDeep<
        Prisma.ShipmentGetPayload<{
          include: {
            orders: {
              include: {
                client: {
                  include: {
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
              };
            };
            vehicle: {
              select: {
                id: true;
                licensePlate: true;
                brand: true;
                model: true;
              };
            };
            status: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        }>
      >();

      shipmentMock.vehicleId = shipment.vehicleId;
      shipmentMock.statusId = ShipmentStatusId.Shipped;
      shipmentMock.orders = [
        {
          id: 2,
          createdAt: mockDeep<Date>(new Date('2000-05-15 08:35:23')),
          client: {
            addressId: 1,
            companyName: 'Test Client',
            id: 1,
            taxCategoryId: 1,
            userId: 1,
            user: {
              email: 'client@test.com',
            },
          },
          clientId: 1,
          deliveryMethodId: DeliveryMethodId.HomeDelivery,
          orderStatusId: OrderStatusId.Prepared,
          paymentDetailId: 1,
          shipmentId: 1,
          totalAmount: mockDeep<Prisma.Decimal>(new Prisma.Decimal(250)),
        },
      ];

      const finishShipmentDtoMock: FinishShipmentDto = {
        finishedAt: new Date('2000-05-15 10:53:25'),
        odometer: 120000,
        orders: [
          {
            orderId: 2,
            orderStatusId: 4,
          },
        ],
      };

      const lastVehicleUsageMock = {
        id: 1,
        date: new Date('2000-05-10'),
        vehicleId: 1,
        odometer: new Prisma.Decimal(100000),
        kmUsed: new Prisma.Decimal(50),
      };

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(shipmentMock);

      jest
        .spyOn(vehicleUsageRepository, 'findLastByVehicleIdAsync')
        .mockResolvedValueOnce(lastVehicleUsageMock);

      jest
        .spyOn(orderRepository, 'findOrdersByShipmentIdAsync')
        .mockResolvedValueOnce(shipmentMock.orders);

      const txMock = {} as Prisma.TransactionClient;
      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      // Act
      await service.finishShipmentAsync(shipmentId, finishShipmentDtoMock);

      // Assert
      expect(
        vehicleRepository.updateVehicleKmTraveledAsync,
      ).toHaveBeenCalledWith(
        shipmentMock.vehicleId,
        finishShipmentDtoMock.odometer,
        txMock,
      );
    });
  });

  describe('getOrCreateShipmentRoute', () => {
    it('should return existing routeLink if present', async () => {
      const shipmentId = 1;

      const shipmentMock = mockDeep<
        Prisma.ShipmentGetPayload<{
          include: {
            orders: {
              include: {
                client: {
                  include: {
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
              };
            };
            vehicle: {
              select: {
                id: true;
                licensePlate: true;
                brand: true;
                model: true;
              };
            };
            status: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        }>
      >();

      shipmentMock.id = shipmentId;
      shipmentMock.routeLink = 'https://maps.google.com/route';

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(shipmentMock);

      const result = await service.getOrCreateShipmentRoute(shipmentId);

      expect(repository.findByIdAsync).toHaveBeenCalledWith(shipmentId);
      expect(result).toBe('https://maps.google.com/route');
    });

    it('should call geocodeAsync for each order and batchOptimizeToursAsync, then update shipment', async () => {
      const shipmentId = 1;

      const ordersMock = [
        {
          id: 10,
          client: {
            address: {
              street: 'Calle Falsa',
              streetNumber: 123,
              town: {
                name: 'Springfield',
                province: {
                  name: 'Buenos Aires',
                  country: { name: 'Argentina' },
                },
              },
            },
          },
        },
        {
          id: 11,
          client: {
            address: {
              street: 'Av Siempre Viva',
              streetNumber: 742,
              town: {
                name: 'Shelbyville',
                province: { name: 'Cordoba', country: { name: 'Argentina' } },
              },
            },
          },
        },
      ];

      const shipmentMock = mockDeep<
        Prisma.ShipmentGetPayload<{
          include: {
            orders: {
              include: {
                client: {
                  include: {
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
              };
            };
            vehicle: {
              select: {
                id: true;
                licensePlate: true;
                brand: true;
                model: true;
              };
            };
            status: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        }>
      >();

      shipmentMock.id = shipmentId;
      shipmentMock.routeLink = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shipmentMock.orders = ordersMock as any;

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(shipmentMock);

      const geocodeResults = [
        { lat: -33.1, lng: -60.1 },
        { lat: -33.2, lng: -60.2 },
      ];

      const geocodeSpy = jest
        .spyOn(service['googleMapsRoutingService'], 'geocodeAsync')
        .mockResolvedValueOnce(geocodeResults[0])
        .mockResolvedValueOnce(geocodeResults[1]);

      const batchOptimizeResult = {
        routeLink: 'https://maps.google.com/optimized-route',
        estimatedKm: 12.5,
      };

      const batchOptimizeSpy = jest
        .spyOn(service['googleMapsRoutingService'], 'batchOptimizeToursAsync')
        .mockResolvedValueOnce(batchOptimizeResult);

      const updateShipmentSpy = jest
        .spyOn(repository, 'updateShipmentAsync')
        .mockResolvedValueOnce({} as Shipment);

      const result = await service.getOrCreateShipmentRoute(shipmentId);

      expect(repository.findByIdAsync).toHaveBeenCalledWith(shipmentId);
      expect(geocodeSpy).toHaveBeenCalledTimes(2);
      expect(batchOptimizeSpy).toHaveBeenCalledWith({
        shipments: [
          {
            deliveries: [
              {
                arrivalLocation: {
                  latitude: geocodeResults[0].lat,
                  longitude: geocodeResults[0].lng,
                },
                duration: { seconds: 300 },
              },
            ],
          },
          {
            deliveries: [
              {
                arrivalLocation: {
                  latitude: geocodeResults[1].lat,
                  longitude: geocodeResults[1].lng,
                },
                duration: { seconds: 300 },
              },
            ],
          },
        ],
      });
      expect(updateShipmentSpy).toHaveBeenCalledWith(shipmentId, {
        routeLink: batchOptimizeResult.routeLink,
        estimatedKm: batchOptimizeResult.estimatedKm,
      });
      expect(result).toBe(batchOptimizeResult.routeLink);
    });
  });

  describe('createShipmentAsync', () => {
    it('should throw NotFoundException if shipment does not exist', async () => {
      // Arrange
      const shipmentId = shipment.id;

      jest.spyOn(repository, 'findByIdAsync').mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.findByIdAsync(shipmentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should call shipmentRepository.findByIdAsync with the correct data', async () => {
      // Arrange
      const shipmentId = shipment.id;
      const shipmentMock = mockDeep<
        Prisma.ShipmentGetPayload<{
          include: {
            orders: {
              include: {
                client: {
                  include: {
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
              };
            };
            vehicle: {
              select: {
                id: true;
                licensePlate: true;
                brand: true;
                model: true;
              };
            };
            status: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        }>
      >();

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(shipmentMock);

      // Act
      await service.findByIdAsync(shipmentId);

      // Assert
      expect(repository.findByIdAsync).toHaveBeenCalledWith(shipmentId);
    });
  });

  describe('searchWithFiltersAsync', () => {
    it('should call searchWithFiltersAsync on the repository with correct parameters', async () => {
      // Arrange
      const searchText = 'test';
      const filters: SearchShipmentFiltersDto = {
        statusName: ['Pending'],
        fromDate: '2025-01-01',
        toDate: '2025-12-31',
      };
      const page = 1;
      const pageSize = 10;
      const query = new SearchShipmentQuery({
        searchText,
        filters,
        page,
        pageSize,
      });

      // Act
      await service.searchWithFiltersAsync(query);

      // Assert
      expect(repository.searchWithFiltersAsync).toHaveBeenCalledWith(
        query.page,
        query.pageSize,
        query.searchText,
        query.filters,
      );
    });
  });

  describe('downloadWithFiltersAsync', () => {
    it('should call downloadWithFiltersAsync on the repository with correct parameters', async () => {
      // Arrange
      const searchText = 'test';
      const filters: SearchShipmentFiltersDto = {
        statusName: ['Pending'],
        fromDate: '2025-01-01',
        toDate: '2025-12-31',
      };
      const query = new DownloadShipmentQuery({
        searchText,
        filters,
      });

      // Act
      await service.downloadWithFiltersAsync(query);

      // Assert
      expect(repository.downloadWithFiltersAsync).toHaveBeenCalledWith(
        query.searchText,
        query.filters,
      );
    });
  });
});
