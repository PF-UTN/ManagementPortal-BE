import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { PaymentTypeRepository } from './payment-type.repository';
import { PrismaService } from '../prisma.service';

describe('PaymentTypeRepository', () => {
  let repository: PaymentTypeRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentTypeRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    repository = module.get<PaymentTypeRepository>(PaymentTypeRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should return payment type when found', async () => {
    // Arrange
    const paymentTypeMock = {
      id: 1,
      name: 'Efectivo',
      description: 'Pago en efectivo',
    };
    jest
      .spyOn(prismaService.paymentType, 'findUnique')
      .mockResolvedValue(paymentTypeMock);

    // Act
    const result = await repository.findPaymentTypeByIdAsync(1);

    // Assert
    expect(prismaService.paymentType.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result).toEqual(paymentTypeMock);
  });

  it('should return null when payment type not found', async () => {
    // Arrange
    jest.spyOn(prismaService.paymentType, 'findUnique').mockResolvedValue(null);

    // Act
    const result = await repository.findPaymentTypeByIdAsync(999);

    // Assert
    expect(prismaService.paymentType.findUnique).toHaveBeenCalledWith({
      where: { id: 999 },
    });
    expect(result).toBeNull();
  });
});
