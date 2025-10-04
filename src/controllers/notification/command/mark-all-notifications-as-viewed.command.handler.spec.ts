import { Test, TestingModule } from '@nestjs/testing';
import { Notification } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { MarkAllNotificationsAsViewedCommand } from './mark-all-notifications-as-viewed.command';
import { MarkAllNotificationsAsViewedCommandHandler } from './mark-all-notifications-as-viewed.command.handler';
import { AuthenticationService } from '../../../domain/service/authentication/authentication.service';
import { NotificationService } from '../../../domain/service/notification/notification.service';

describe('CreateProductCommandHandler', () => {
  let handler: MarkAllNotificationsAsViewedCommandHandler;
  let notificationService: NotificationService;
  let authenticationService: AuthenticationService;
  let notification: ReturnType<typeof mockDeep<Notification>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarkAllNotificationsAsViewedCommandHandler,
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

    handler = module.get<MarkAllNotificationsAsViewedCommandHandler>(
      MarkAllNotificationsAsViewedCommandHandler,
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

  it('should call markAllNotificationsAsViewedAsync with correct parameters', async () => {
    // Arrange
    const authHeader = 'bearer <token>';
    const userId = notification.userId;

    const command = new MarkAllNotificationsAsViewedCommand(authHeader);

    jest
      .spyOn(authenticationService, 'decodeTokenAsync')
      .mockResolvedValueOnce({ sub: userId });

    const markNotificationAsViewedAsyncSpy = jest.spyOn(
      notificationService,
      'markAllNotificationsAsViewedAsync',
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(markNotificationAsViewedAsyncSpy).toHaveBeenCalledWith(userId);
  });
});
