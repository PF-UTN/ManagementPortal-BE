/* eslint-disable @typescript-eslint/no-explicit-any */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, Shipment } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import {
  DeliveryMethodId,
  OrderStatusId,
  ShipmentStatusId,
} from '@mp/common/constants';
import {
  FinishShipmentDto,
  SearchShipmentFiltersDto,
  ShipmentCreationDto,
} from '@mp/common/dtos';
import {
  ShipmentRepository,
  OrderRepository,
  VehicleRepository,
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
                    address: {
                      include: {
                        town: {
                          include: {
                            province: {
                              include: {
                                country: true;
                              };
                            };
                          };
                        };
                      };
                    };
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
                orderStatus: {
                  select: {
                    id: true;
                    name: true;
                  };
                };
                orderItems: {
                  select: {
                    productId: true;
                    quantity: true;
                  };
                };
                paymentDetail: {
                  select: {
                    paymentTypeId: true;
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
                kmTraveled: true;
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
                    address: {
                      include: {
                        town: {
                          include: {
                            province: {
                              include: {
                                country: true;
                              };
                            };
                          };
                        };
                      };
                    };
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
                orderStatus: {
                  select: {
                    id: true;
                    name: true;
                  };
                };
                orderItems: {
                  select: {
                    productId: true;
                    quantity: true;
                  };
                };
                paymentDetail: {
                  select: {
                    paymentTypeId: true;
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
                kmTraveled: true;
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

      shipmentMock.orders = [{ orderStatusId: OrderStatusId.Pending } as any];

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(shipmentMock);
      jest
        .spyOn(orderRepository, 'findOrdersByShipmentIdAsync')
        .mockResolvedValueOnce(shipmentMock.orders as any);

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
                    address: {
                      include: {
                        town: {
                          include: {
                            province: {
                              include: {
                                country: true;
                              };
                            };
                          };
                        };
                      };
                    };
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
                orderStatus: {
                  select: {
                    id: true;
                    name: true;
                  };
                };
                orderItems: {
                  select: {
                    productId: true;
                    quantity: true;
                  };
                };
                paymentDetail: {
                  select: {
                    paymentTypeId: true;
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
                kmTraveled: true;
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

      shipmentMock.orders = [
        { deliveryMethodId: DeliveryMethodId.PickUpAtStore } as any,
      ];

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(shipmentMock);
      jest
        .spyOn(orderRepository, 'findOrdersByShipmentIdAsync')
        .mockResolvedValueOnce(shipmentMock.orders as any);

      // Act & Assert
      await expect(service.sendShipmentAsync(shipmentId)).rejects.toThrow(
        BadRequestException,
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
                    address: {
                      include: {
                        town: {
                          include: {
                            province: {
                              include: {
                                country: true;
                              };
                            };
                          };
                        };
                      };
                    };
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
                orderStatus: {
                  select: {
                    id: true;
                    name: true;
                  };
                };
                orderItems: {
                  select: {
                    productId: true;
                    quantity: true;
                  };
                };
                paymentDetail: {
                  select: {
                    paymentTypeId: true;
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
                kmTraveled: true;
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
                    address: {
                      include: {
                        town: {
                          include: {
                            province: {
                              include: {
                                country: true;
                              };
                            };
                          };
                        };
                      };
                    };
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
                orderStatus: {
                  select: {
                    id: true;
                    name: true;
                  };
                };
                orderItems: {
                  select: {
                    productId: true;
                    quantity: true;
                  };
                };
                paymentDetail: {
                  select: {
                    paymentTypeId: true;
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
                kmTraveled: true;
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
            address: {
              town: {
                name: 'Rosario',
                id: 1,
                province: {
                  country: {
                    id: 1,
                    name: 'Argentina',
                  },
                  countryId: 1,
                  id: 1,
                  name: 'Santa Fe',
                },
                provinceId: 1,
                zipCode: '2000',
              },
              id: 1,
              street: 'Calle Falsa',
              streetNumber: 123,
              townId: 1,
            },
          },
          paymentDetail: {
            paymentTypeId: 1,
          },
          orderItems: [
            {
              productId: 1,
              quantity: 1,
            },
          ],
          clientId: 1,
          deliveryMethodId: DeliveryMethodId.HomeDelivery,
          orderStatusId: OrderStatusId.Prepared,
          paymentDetailId: 1,
          shipmentId: 1,
          totalAmount: mockDeep<Prisma.Decimal>(new Prisma.Decimal(250)),
          orderStatus: {
            id: OrderStatusId.Prepared,
            name: 'Prepared',
          },
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
                    address: {
                      include: {
                        town: {
                          include: {
                            province: {
                              include: {
                                country: true;
                              };
                            };
                          };
                        };
                      };
                    };
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
                orderStatus: {
                  select: {
                    id: true;
                    name: true;
                  };
                };
                orderItems: {
                  select: {
                    productId: true;
                    quantity: true;
                  };
                };
                paymentDetail: {
                  select: {
                    paymentTypeId: true;
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
                kmTraveled: true;
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
            address: {
              town: {
                name: 'Rosario',
                id: 1,
                province: {
                  country: {
                    id: 1,
                    name: 'Argentina',
                  },
                  countryId: 1,
                  id: 1,
                  name: 'Santa Fe',
                },
                provinceId: 1,
                zipCode: '2000',
              },
              id: 1,
              street: 'Calle Falsa',
              streetNumber: 123,
              townId: 1,
            },
          },
          paymentDetail: {
            paymentTypeId: 1,
          },
          orderItems: [
            {
              productId: 1,
              quantity: 1,
            },
          ],
          clientId: 1,
          deliveryMethodId: DeliveryMethodId.HomeDelivery,
          orderStatusId: OrderStatusId.Prepared,
          paymentDetailId: 1,
          shipmentId: 1,
          totalAmount: mockDeep<Prisma.Decimal>(new Prisma.Decimal(250)),
          orderStatus: {
            id: OrderStatusId.Prepared,
            name: 'Prepared',
          },
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
            address: {
              town: {
                name: 'Rosario',
                id: 1,
                province: {
                  country: {
                    id: 1,
                    name: 'Argentina',
                  },
                  countryId: 1,
                  id: 1,
                  name: 'Santa Fe',
                },
                provinceId: 1,
                zipCode: '2000',
              },
              id: 1,
              street: 'Calle Falsa',
              streetNumber: 123,
              townId: 1,
            },
          },
          paymentDetail: {
            paymentTypeId: 1,
          },
          orderItems: [
            {
              productId: 1,
              quantity: 1,
            },
          ],
          clientId: 1,
          deliveryMethodId: DeliveryMethodId.HomeDelivery,
          orderStatusId: OrderStatusId.Prepared,
          paymentDetailId: 1,
          shipmentId: 1,
          totalAmount: mockDeep<Prisma.Decimal>(new Prisma.Decimal(250)),
          orderStatus: {
            id: OrderStatusId.Prepared,
            name: 'Prepared',
          },
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
                    address: {
                      include: {
                        town: {
                          include: {
                            province: {
                              include: {
                                country: true;
                              };
                            };
                          };
                        };
                      };
                    };
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
                orderStatus: {
                  select: {
                    id: true;
                    name: true;
                  };
                };
                orderItems: {
                  select: {
                    productId: true;
                    quantity: true;
                  };
                };
                paymentDetail: {
                  select: {
                    paymentTypeId: true;
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
                kmTraveled: true;
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
            address: {
              town: {
                name: 'Rosario',
                id: 1,
                province: {
                  country: {
                    id: 1,
                    name: 'Argentina',
                  },
                  countryId: 1,
                  id: 1,
                  name: 'Santa Fe',
                },
                provinceId: 1,
                zipCode: '2000',
              },
              id: 1,
              street: 'Calle Falsa',
              streetNumber: 123,
              townId: 1,
            },
          },
          paymentDetail: {
            paymentTypeId: 1,
          },
          orderItems: [
            {
              productId: 1,
              quantity: 1,
            },
          ],
          clientId: 1,
          deliveryMethodId: DeliveryMethodId.HomeDelivery,
          orderStatusId: OrderStatusId.Prepared,
          paymentDetailId: 1,
          shipmentId: 1,
          totalAmount: mockDeep<Prisma.Decimal>(new Prisma.Decimal(250)),
          orderStatus: {
            id: OrderStatusId.Prepared,
            name: 'Prepared',
          },
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
                    address: {
                      include: {
                        town: {
                          include: {
                            province: {
                              include: {
                                country: true;
                              };
                            };
                          };
                        };
                      };
                    };
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
                orderStatus: {
                  select: {
                    id: true;
                    name: true;
                  };
                };
                orderItems: {
                  select: {
                    productId: true;
                    quantity: true;
                  };
                };
                paymentDetail: {
                  select: {
                    paymentTypeId: true;
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
                kmTraveled: true;
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
            address: {
              town: {
                name: 'Rosario',
                id: 1,
                province: {
                  country: {
                    id: 1,
                    name: 'Argentina',
                  },
                  countryId: 1,
                  id: 1,
                  name: 'Santa Fe',
                },
                provinceId: 1,
                zipCode: '2000',
              },
              id: 1,
              street: 'Calle Falsa',
              streetNumber: 123,
              townId: 1,
            },
          },
          paymentDetail: {
            paymentTypeId: 1,
          },
          orderItems: [
            {
              productId: 1,
              quantity: 1,
            },
          ],
          clientId: 1,
          deliveryMethodId: DeliveryMethodId.HomeDelivery,
          orderStatusId: OrderStatusId.Prepared,
          paymentDetailId: 1,
          shipmentId: 1,
          totalAmount: mockDeep<Prisma.Decimal>(new Prisma.Decimal(250)),
          orderStatus: {
            id: OrderStatusId.Prepared,
            name: 'Prepared',
          },
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
                    address: {
                      include: {
                        town: {
                          include: {
                            province: {
                              include: {
                                country: true;
                              };
                            };
                          };
                        };
                      };
                    };
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
                orderStatus: {
                  select: {
                    id: true;
                    name: true;
                  };
                };
                orderItems: {
                  select: {
                    productId: true;
                    quantity: true;
                  };
                };
                paymentDetail: {
                  select: {
                    paymentTypeId: true;
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
                kmTraveled: true;
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
                    address: {
                      include: {
                        town: {
                          include: {
                            province: {
                              include: {
                                country: true;
                              };
                            };
                          };
                        };
                      };
                    };
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
                orderStatus: {
                  select: {
                    id: true;
                    name: true;
                  };
                };
                orderItems: {
                  select: {
                    productId: true;
                    quantity: true;
                  };
                };
                paymentDetail: {
                  select: {
                    paymentTypeId: true;
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
                kmTraveled: true;
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
                    address: {
                      include: {
                        town: {
                          include: {
                            province: {
                              include: {
                                country: true;
                              };
                            };
                          };
                        };
                      };
                    };
                    user: {
                      select: {
                        email: true;
                      };
                    };
                  };
                };
                orderStatus: {
                  select: {
                    id: true;
                    name: true;
                  };
                };
                orderItems: {
                  select: {
                    productId: true;
                    quantity: true;
                  };
                };
                paymentDetail: {
                  select: {
                    paymentTypeId: true;
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
                kmTraveled: true;
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
