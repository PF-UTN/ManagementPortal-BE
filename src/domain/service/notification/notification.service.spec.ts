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
});
