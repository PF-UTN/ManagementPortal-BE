import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Notification } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { NotificationRepository } from '@mp/repository';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let repository: NotificationRepository;
  let notification: ReturnType<typeof mockDeep<Notification>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: NotificationRepository,
          useValue: mockDeep(NotificationRepository),
        },
      ],
    }).compile();

    repository = module.get<NotificationRepository>(NotificationRepository);

    service = module.get<NotificationService>(NotificationService);

    notification = mockDeep<Notification>();

    notification.id = 1;
    notification.userId = 1;
    notification.timestamp = mockDeep<Date>(new Date('2025-01-15'));
    notification.message = 'Test notification';
    notification.viewed = false;
    notification.deleted = false;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNotificationsByUserIdAsync', () => {
    it('should call notificationRepository.getNotificationsByUserIdAsync with correct data', async () => {
      // Arrange
      const userId = notification.userId;
      const notificationsMock = [
        {
          ...notification,
        },
      ];
      jest
        .spyOn(repository, 'getNotificationsByUserIdAsync')
        .mockResolvedValueOnce(notificationsMock);

      // Act
      await service.getNotificationsByUserIdAsync(userId);

      // Assert
      expect(repository.getNotificationsByUserIdAsync).toHaveBeenCalledWith(
        userId,
      );
    });
  });

  describe('markNotificationAsViewedAsync', () => {
    it('should throw NotFoundException if notification does not exist', async () => {
      // Arrange
      const notificationId = notification.id;
      const userId = notification.userId;

      jest.spyOn(repository, 'findByIdAsync').mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.markNotificationAsViewedAsync(notificationId, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if userId does not match notification.userId', async () => {
      // Arrange
      const notificationId = notification.id;
      const userId = 999;

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(notification);

      // Act & Assert
      await expect(
        service.markNotificationAsViewedAsync(notificationId, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should call repository.markNotificationAsViewedAsync with the correct data', async () => {
      // Arrange
      const notificationId = notification.id;
      const userId = notification.userId;

      const updateNotificationDataMock = {
        viewed: true,
      };

      const updatedNotification = {
        ...notification,
        viewed: true,
      };

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(notification);

      jest
        .spyOn(repository, 'updateNotificationAsync')
        .mockResolvedValueOnce(updatedNotification);

      // Act
      await service.markNotificationAsViewedAsync(notificationId, userId);

      // Assert
      expect(repository.updateNotificationAsync).toHaveBeenCalledWith(
        notification.id,
        updateNotificationDataMock,
      );
    });
  });

  describe('deleteNotificationAsync', () => {
    it('should throw NotFoundException if notification does not exist', async () => {
      // Arrange
      const notificationId = notification.id;
      const userId = notification.userId;

      jest.spyOn(repository, 'findByIdAsync').mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.deleteNotificationAsync(notificationId, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if userId does not match notification.userId', async () => {
      // Arrange
      const notificationId = notification.id;
      const userId = 999;

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(notification);

      // Act & Assert
      await expect(
        service.deleteNotificationAsync(notificationId, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should call repository.deleteNotificationAsync with the correct data', async () => {
      // Arrange
      const notificationId = notification.id;
      const userId = notification.userId;

      const updateNotificationDataMock = {
        deleted: true,
      };

      const deletedNotification = {
        ...notification,
        deleted: true,
      };

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(notification);

      jest
        .spyOn(repository, 'updateNotificationAsync')
        .mockResolvedValueOnce(deletedNotification);

      // Act
      await service.deleteNotificationAsync(notificationId, userId);

      // Assert
      expect(repository.updateNotificationAsync).toHaveBeenCalledWith(
        notification.id,
        updateNotificationDataMock,
      );
    });
  });

  describe('markAllNotificationsAsViewedAsync', () => {
    it('should call repository.markAllNotificationsAsViewedAsync with the correct data', async () => {
      // Arrange
      const userId = notification.userId;

      const updateNotificationDataMock = {
        viewed: true,
      };

      jest
        .spyOn(repository, 'updateManyNotificationsByUserIdAsync')
        .mockResolvedValueOnce({ count: 1 });

      // Act
      await service.markAllNotificationsAsViewedAsync(userId);

      // Assert
      expect(
        repository.updateManyNotificationsByUserIdAsync,
      ).toHaveBeenCalledWith(userId, updateNotificationDataMock);
    });
  });
});
