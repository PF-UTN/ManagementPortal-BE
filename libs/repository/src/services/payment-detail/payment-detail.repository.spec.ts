import { Test, TestingModule } from '@nestjs/testing';
import { PaymentDetail, Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { PaymentDetailDataDto } from '@mp/common/dtos';
import { PaymentDetailRepository, PrismaService } from '@mp/repository';

describe('PaymentDetailRepository', () => {
  let repository: PaymentDetailRepository;
  let prismaService: PrismaService;
  let paymentDetail: ReturnType<typeof mockDeep<PaymentDetail>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentDetailRepository,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    repository = module.get<PaymentDetailRepository>(PaymentDetailRepository);

    paymentDetail = mockDeep<PaymentDetail>();
    paymentDetail.id = 1;
    paymentDetail.paymentTypeId = 1;
  });

  describe('createPaymentDetailAsync', () => {
    it('should create an payment detail with the provided data (without tx)', async () => {
      // Arrange
      const paymentDetailDataMock: PaymentDetailDataDto = {
        paymentTypeId: 1,
      };
      jest
        .spyOn(prismaService.paymentDetail, 'create')
        .mockResolvedValueOnce(paymentDetail);

      // Act
      const result = await repository.createPaymentDetailAsync(
        paymentDetailDataMock,
      );

      // Assert
      expect(result).toEqual(paymentDetail);
    });

    it('should call prisma.order.create with correct data (without tx)', async () => {
      // Arrange
      const paymentDetailDataMock: PaymentDetailDataDto = {
        paymentTypeId: 1,
      };
      jest
        .spyOn(prismaService.paymentDetail, 'create')
        .mockResolvedValueOnce(paymentDetail);

      // Act
      await repository.createPaymentDetailAsync(paymentDetailDataMock);

      // Assert
      expect(prismaService.paymentDetail.create).toHaveBeenCalledWith({
        data: { ...paymentDetailDataMock },
      });
    });

    it('should call tx.order.create with correct data when tx is provided', async () => {
      // Arrange
      const txMock = {
        paymentDetail: { create: jest.fn().mockResolvedValue(paymentDetail) },
      } as unknown as Prisma.TransactionClient;
      const paymentDetailDataMock: PaymentDetailDataDto = {
        paymentTypeId: 1,
      };

      // Act
      const result = await repository.createPaymentDetailAsync(
        paymentDetailDataMock,
        txMock,
      );

      // Assert
      expect(txMock.paymentDetail.create).toHaveBeenCalledWith({
        data: { ...paymentDetailDataMock },
      });
      expect(result).toEqual(paymentDetail);
    });
  });
});
