import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { BillItemRepository } from './bill-item.repository';
import { PrismaService } from '../prisma.service';

describe('BillItemRepository', () => {
  let repository: BillItemRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillItemRepository,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    repository = module.get<BillItemRepository>(BillItemRepository);
  });

  describe('createManyBillItemAsync', () => {
    const billItemsData: Prisma.BillItemCreateManyInput[] = [
      { subTotalPrice: 50, billId: 1 },
      { subTotalPrice: 70, billId: 1 },
    ];

    it('should call prisma.billItem.createMany with correct data (without tx)', async () => {
      // Arrange
      jest
        .spyOn(prismaService.billItem, 'createMany')
        .mockResolvedValueOnce({ count: 2 });

      // Act
      await repository.createManyBillItemAsync(billItemsData);

      // Assert
      expect(prismaService.billItem.createMany).toHaveBeenCalledWith({
        data: billItemsData,
      });
    });

    it('should call tx.billItem.createMany with correct data when tx is provided', async () => {
      // Arrange
      const txMock = {
        billItem: { createMany: jest.fn().mockResolvedValue({ count: 2 }) },
      } as unknown as Prisma.TransactionClient;

      // Act
      await repository.createManyBillItemAsync(billItemsData, txMock);

      // Assert
      expect(txMock.billItem.createMany).toHaveBeenCalledWith({
        data: billItemsData,
      });
    });
  });
});
