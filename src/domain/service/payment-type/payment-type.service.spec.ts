import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { PaymentTypeRepository } from './../../../../libs/repository/src/services/payment-type/payment-type.repository';
import { PaymentTypeService } from './payment-type.service';

describe('PaymentTypeService', () => {
  let service: PaymentTypeService;
  let paymentTypeRepository: PaymentTypeRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentTypeService,
        {
          provide: PaymentTypeRepository,
          useValue: mockDeep<PaymentTypeRepository>(),
        },
      ],
    }).compile();

    service = module.get<PaymentTypeService>(PaymentTypeService);
    paymentTypeRepository = module.get<PaymentTypeRepository>(
      PaymentTypeRepository,
    );
  });

  it('should return payment type when found', async () => {
    // Arrange
    const paymentTypeMock = {
      id: 1,
      name: 'Efectivo',
      description: 'Pago en efectivo',
    };
    jest
      .spyOn(paymentTypeRepository, 'findPaymentTypeByIdAsync')
      .mockResolvedValue(paymentTypeMock);

    // Act
    const result = await service.findPaymentTypeByIdAsync(1);

    // Assert
    expect(result).toEqual(paymentTypeMock);
  });

  it('should return null when payment type not found', async () => {
    // Arrange
    jest
      .spyOn(paymentTypeRepository, 'findPaymentTypeByIdAsync')
      .mockResolvedValue(null);

    // Act
    const result = await service.findPaymentTypeByIdAsync(999);

    // Assert
    expect(result).toBeNull();
  });
});
