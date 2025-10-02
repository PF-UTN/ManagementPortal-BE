import { Test, TestingModule } from '@nestjs/testing';
import { Notification, Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { PrismaService } from '../prisma.service';
import { NotificationRepository } from './notification.repository';

describe('NotificationRepository', () => {
  let repository: NotificationRepository;
  let prismaService: PrismaService;
  let notification: ReturnType<typeof mockDeep<Notification>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    repository = module.get<NotificationRepository>(NotificationRepository);

    notification = mockDeep<Notification>();

    notification.id = 1;
    notification.userId = 1;
    notification.timestamp = mockDeep<Date>(new Date('2025-01-15'));
    notification.message = 'Test notification';
    notification.viewed = false;
    notification.deleted = false;
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getNotificationsByUserIdAsync', () => {
    it('should call prisma.notification.findMany with correct data', async () => {
      // Arrange
      const userId = notification.userId;
      const notificationsMock = [
        {
          ...notification,
        },
      ];
      jest
        .spyOn(prismaService.notification, 'findMany')
        .mockResolvedValueOnce(notificationsMock);

      // Act
      await repository.getNotificationsByUserIdAsync(userId);

      // Assert
      expect(prismaService.notification.findMany).toHaveBeenCalledWith({
        where: { userId, deleted: false },
        orderBy: { timestamp: 'desc' },
      });
    });

    it('should return an array of notifications', async () => {
      // Arrange
      const userId = notification.userId;
      const notificationsMock = [
        {
          ...notification,
        },
      ];
      jest
        .spyOn(prismaService.notification, 'findMany')
        .mockResolvedValueOnce(notificationsMock);

      // Act
      const foundNotifications =
        await repository.getNotificationsByUserIdAsync(userId);

      // Assert
      expect(foundNotifications).toBe(notificationsMock);
    });
  });

  describe('updateNotificationAsync', () => {
    it('should update an existing notification', async () => {
      // Arrange
      const notificationId = notification.id;
      const notificationUpdateDataMock: Prisma.NotificationUpdateInput = {
        viewed: true,
      };
      const notificationMock = {
        ...notification,
        viewed: true,
      };

      jest
        .spyOn(prismaService.notification, 'update')
        .mockResolvedValueOnce(notificationMock);

      // Act
      const updatedNotification = await repository.updateNotificationAsync(
        notificationId,
        notificationUpdateDataMock,
      );

      // Assert
      expect(updatedNotification).toEqual(notificationMock);
    });
  });
});
