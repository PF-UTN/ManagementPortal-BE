import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { SupplierController } from './supplier.controller';

describe('SupplierController', () => {
  let controller: SupplierController;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupplierController],
      providers: [
        {
          provide: QueryBus,
          useValue: mockDeep(QueryBus),
        },
      ],
    }).compile();

    queryBus = module.get<QueryBus>(QueryBus);

    controller = module.get<SupplierController>(SupplierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('getAllSuppliersAsync', () => {
    it('should call execute on the queryBus', async () => {
      // Act
      await controller.getAllSuppliersAsync();

      // Assert
      expect(queryBus.execute).toHaveBeenCalled();
    });
  });
});
