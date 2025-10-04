import { Test, TestingModule } from '@nestjs/testing';
import { Notification } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { GetUserNotificationsQuery } from './get-user-notifications.query';
import { GetUserNotificationsQueryHandler } from './get-user-notifications.query.handler';
import { AuthenticationService } from '../../../domain/service/authentication/authentication.service';
import { NotificationService } from '../../../domain/service/notification/notification.service';

describe('GetUserNotificationsQueryHandler', () => {
  let handler: GetUserNotificationsQueryHandler;
  let notificationService: NotificationService;
  let authenticationService: AuthenticationService;
  let notification: ReturnType<typeof mockDeep<Notification>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserNotificationsQueryHandler,
        {
          provide: NotificationService,
          useValue: mockDeep(NotificationService),
        },
        {
          provide: AuthenticationService,
          useValue: mockDeep(AuthenticationService),
        },
      ],
    }).compile();

    notificationService = module.get<NotificationService>(NotificationService);
    authenticationService = module.get<AuthenticationService>(
      AuthenticationService,
    );

    handler = module.get<GetUserNotificationsQueryHandler>(
      GetUserNotificationsQueryHandler,
    );

    notification = mockDeep<Notification>();

    notification.id = 1;
    notification.userId = 1;
    notification.timestamp = mockDeep<Date>(new Date('2025-01-15'));
    notification.message = 'Test notification';
    notification.viewed = false;
    notification.deleted = false;
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should call getNotificationsByUserIdAsync on the service', async () => {
      // Arrange
      const authHeader = 'bearer <token>';
      const userId = 1;
      const notificationsMock = [
        {
          ...notification,
        },
      ];
      const expectedQuery = new GetUserNotificationsQuery(authHeader);
      jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValueOnce({ sub: userId });
      jest
        .spyOn(notificationService, 'getNotificationsByUserIdAsync')
        .mockResolvedValueOnce(notificationsMock);

      const getAllNotificationsAsyncSpy = jest.spyOn(
        notificationService,
        'getNotificationsByUserIdAsync',
      );

      // Act
      await handler.execute(expectedQuery);

      // Assert
      expect(getAllNotificationsAsyncSpy).toHaveBeenCalledWith(userId);
    });
  });
});
