import { Test, TestingModule } from '@nestjs/testing';
import { Notification } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { MarkNotificationAsViewedCommand } from './mark-notification-as-viewed.command';
import { MarkNotificationAsViewedCommandHandler } from './mark-notification-as-viewed.command.handler';
import { AuthenticationService } from '../../../domain/service/authentication/authentication.service';
import { NotificationService } from '../../../domain/service/notification/notification.service';

describe('CreateProductCommandHandler', () => {
  let handler: MarkNotificationAsViewedCommandHandler;
  let notificationService: NotificationService;
  let authenticationService: AuthenticationService;
  let notification: ReturnType<typeof mockDeep<Notification>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarkNotificationAsViewedCommandHandler,
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

    handler = module.get<MarkNotificationAsViewedCommandHandler>(
      MarkNotificationAsViewedCommandHandler,
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

  it('should call markNotificationAsViewedAsync with correct parameters', async () => {
    // Arrange
    const authHeader = 'bearer <token>';
    const notificationId = notification.id;
    const userId = notification.userId;

    const command = new MarkNotificationAsViewedCommand(
      notificationId,
      authHeader,
    );

    jest
      .spyOn(authenticationService, 'decodeTokenAsync')
      .mockResolvedValueOnce({ sub: userId });

    const markNotificationAsViewedAsyncSpy = jest.spyOn(
      notificationService,
      'markNotificationAsViewedAsync',
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(markNotificationAsViewedAsyncSpy).toHaveBeenCalledWith(
      notificationId,
      userId,
    );
  });
});
