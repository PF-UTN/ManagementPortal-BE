import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { supplierCreationDtoMock } from '@mp/common/testing';

import { CreateSupplierCommand } from './create-supplier.command';
import { CreateSupplierCommandHandler } from './create-supplier.command.handler';
import { SupplierService } from '../../../domain/service/supplier/supplier.service';

describe('CreateProductCommandHandler', () => {
  let handler: CreateSupplierCommandHandler;
  let supplierService: SupplierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSupplierCommandHandler,
        {
          provide: SupplierService,
          useValue: mockDeep(SupplierService),
        },
      ],
    }).compile();

    supplierService = module.get<SupplierService>(SupplierService);

    handler = module.get<CreateSupplierCommandHandler>(
      CreateSupplierCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call createOrUpdateSupplierAsync with correct parameters', async () => {
    // Arrange
    const command = new CreateSupplierCommand(supplierCreationDtoMock);
    const createOrUpdateSupplierAsyncSpy = jest.spyOn(
      supplierService,
      'createOrUpdateSupplierAsync',
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(createOrUpdateSupplierAsyncSpy).toHaveBeenCalledWith(
      command.supplierCreationDto,
    );
  });
});
