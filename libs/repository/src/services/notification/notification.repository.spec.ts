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

  describe('findByIdAsync', () => {
    it('should return a notification if it exists', async () => {
      // Arrange
      const notificationId = 1;
      jest
        .spyOn(prismaService.notification, 'findUnique')
        .mockResolvedValueOnce(notification);

      // Act
      const foundNotification = await repository.findByIdAsync(notificationId);

      // Assert
      expect(foundNotification).toEqual(notification);
    });

    it('should return null if the notification does not exist', async () => {
      // Arrange
      const notificationId = 1;
      jest
        .spyOn(prismaService.notification, 'findUnique')
        .mockResolvedValueOnce(null);

      // Act
      const foundNotification = await repository.findByIdAsync(notificationId);

      // Assert
      expect(foundNotification).toBeNull();
    });
  });

  describe('updateManyNotificationsByUserIdAsync', () => {
    it('should update notifications', async () => {
      // Arrange
      const userId = notification.userId;
      const notificationUpdateDataMock: Prisma.NotificationUpdateInput = {
        viewed: true,
      };

      jest
        .spyOn(prismaService.notification, 'updateMany')
        .mockResolvedValueOnce({ count: 1 });

      // Act
      const result = await repository.updateManyNotificationsByUserIdAsync(
        userId,
        notificationUpdateDataMock,
      );

      // Assert
      expect(result).toEqual({ count: 1 });
    });

    it('should call prisma.updateMany with correct parameters', async () => {
      // Arrange
      const userId = notification.userId;
      const notificationUpdateDataMock: Prisma.NotificationUpdateInput = {
        viewed: true,
      };

      jest
        .spyOn(prismaService.notification, 'updateMany')
        .mockResolvedValueOnce({ count: 1 });

      // Act
      await repository.updateManyNotificationsByUserIdAsync(
        userId,
        notificationUpdateDataMock,
      );

      // Assert
      expect(prismaService.notification.updateMany).toHaveBeenCalledWith({
        where: { userId, viewed: false, deleted: false },
        data: notificationUpdateDataMock,
      });
    });
  });

  describe('createAsync', () => {
    it('should create a notification', async () => {
      // Arrange
      const userId = notification.userId;
      const message = notification.message;
      const notificationMock = { ...notification, id: 2 };

      jest
        .spyOn(prismaService.notification, 'create')
        .mockResolvedValueOnce(notificationMock);

      // Act
      const createdNotification = await repository.createAsync(userId, message);

      // Assert
      expect(createdNotification).toEqual(notificationMock);
    });

    it('should call prisma.create with correct data', async () => {
      // Arrange
      const userId = notification.userId;
      const message = notification.message;

      // Act
      await repository.createAsync(userId, message);

      // Assert
      expect(prismaService.notification.create).toHaveBeenCalledWith({
        data: {
          userId,
          message,
        },
      });
    });
  });

  describe('existsSimilarNotificationAsync', () => {
    it('should return a notification if a similar one exists', async () => {
      // Arrange
      const userId = notification.userId;
      const message = notification.message;
      jest
        .spyOn(prismaService.notification, 'findFirst')
        .mockResolvedValueOnce(notification);

      // Act
      const foundNotification = await repository.existsSimilarNotificationAsync(
        userId,
        message,
      );

      // Assert
      expect(foundNotification).toEqual(notification);
    });

    it('should return null if a similar notification does not exist', async () => {
      // Arrange
      const userId = notification.userId;
      const message = notification.message;
      jest
        .spyOn(prismaService.notification, 'findFirst')
        .mockResolvedValueOnce(null);

      // Act
      const foundNotification = await repository.existsSimilarNotificationAsync(
        userId,
        message,
      );

      // Assert
      expect(foundNotification).toBeNull();
    });

    it('should call prisma.findFirst with correct parameters', async () => {
      // Arrange
      const userId = notification.userId;
      const message = notification.message;

      // Act
      await repository.existsSimilarNotificationAsync(userId, message);

      // Assert
      expect(prismaService.notification.findFirst).toHaveBeenCalledWith({
        where: { userId, message },
      });
    });
  });
});
