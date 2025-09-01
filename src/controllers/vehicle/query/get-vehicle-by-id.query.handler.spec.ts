import { Test, TestingModule } from '@nestjs/testing';
import { Vehicle } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { GetVehicleByIdQuery } from './get-vehicle-by-id.query';
import { GetVehicleByIdQueryHandler } from './get-vehicle-by-id.query.handler';
import { VehicleService } from '../../../domain/service/vehicle/vehicle.service';

describe('GetVehicleByIdQueryHandler', () => {
  let handler: GetVehicleByIdQueryHandler;
  let vehicleService: VehicleService;
  let vehicle: ReturnType<typeof mockDeep<Vehicle>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetVehicleByIdQueryHandler,
        {
          provide: VehicleService,
          useValue: mockDeep(VehicleService),
        },
      ],
    }).compile();

    vehicleService = module.get<VehicleService>(VehicleService);

    handler = module.get<GetVehicleByIdQueryHandler>(
      GetVehicleByIdQueryHandler,
    );

    vehicle = mockDeep<Vehicle>();

    vehicle.id = 1;
    vehicle.licensePlate = 'AB213LM';
    vehicle.brand = 'Toyota';
    vehicle.model = 'Corolla';
    vehicle.kmTraveled = 25000;
    vehicle.admissionDate = mockDeep<Date>();
    vehicle.enabled = true;
    vehicle.deleted = false;
    vehicle.createdAt = mockDeep<Date>();
    vehicle.updatedAt = mockDeep<Date>();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should call findByIdAsync on the service', async () => {
      // Arrange
      const query = new GetVehicleByIdQuery(1);
      jest
        .spyOn(vehicleService, 'findByIdAsync')
        .mockResolvedValueOnce(vehicle);

      const findByIdAsyncSpy = jest.spyOn(vehicleService, 'findByIdAsync');

      // Act
      await handler.execute(query);

      // Assert
      expect(findByIdAsyncSpy).toHaveBeenCalled();
    });
  });
});
