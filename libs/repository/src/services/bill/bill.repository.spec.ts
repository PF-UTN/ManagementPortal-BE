import { Test, TestingModule } from '@nestjs/testing';
import { Bill, Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { PrismaService } from './../prisma.service';
import { BillRepository } from './bill.repository';

describe('BillRepository', () => {
  let repository: BillRepository;
  let prismaService: PrismaService;
  let bill: ReturnType<typeof mockDeep<Bill>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillRepository,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    repository = module.get<BillRepository>(BillRepository);

    bill = mockDeep<Bill>();
    bill.id = 1;
    bill.beforeTaxPrice = mockDeep<Prisma.Decimal>();
    bill.totalPrice = mockDeep<Prisma.Decimal>();
    bill.orderId = 1;
  });

  describe('createBillAsync', () => {
    it('should create a bill with the provided data (without tx)', async () => {
      // Arrange
      jest.spyOn(prismaService.bill, 'create').mockResolvedValueOnce(bill);

      // Act
      const result = await repository.createBillAsync(bill);

      // Assert
      expect(result).toEqual(bill);
    });

    it('should call prisma.bill.create with correct data (without tx)', async () => {
      // Arrange
      jest.spyOn(prismaService.bill, 'create').mockResolvedValueOnce(bill);

      // Act
      await repository.createBillAsync(bill);

      // Assert
      expect(prismaService.bill.create).toHaveBeenCalledWith({
        data: bill,
      });
    });

    it('should call tx.bill.create with correct data when tx is provided', async () => {
      // Arrange
      const txMock = {
        bill: { create: jest.fn().mockResolvedValue(bill) },
      } as unknown as Prisma.TransactionClient;

      // Act
      const result = await repository.createBillAsync(bill, txMock);

      // Assert
      expect(txMock.bill.create).toHaveBeenCalledWith({
        data: bill,
      });
      expect(result).toEqual(bill);
    });
  });
});
