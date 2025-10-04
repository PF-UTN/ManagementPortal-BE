import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { NotificationController } from './notification.controller';

describe('NotificationController', () => {
  let controller: NotificationController;
  let queryBus: QueryBus;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: QueryBus,
          useValue: mockDeep(QueryBus),
        },
        {
          provide: CommandBus,
          useValue: mockDeep(CommandBus),
        },
      ],
    }).compile();

    queryBus = module.get<QueryBus>(QueryBus);
    commandBus = module.get<CommandBus>(CommandBus);

    controller = module.get<NotificationController>(NotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNotificationsByUserIdAsync', () => {
    it('should call execute on the queryBus', async () => {
      // Arrange
      const authHeader = 'bearer <token>';

      // Act
      await controller.getNotificationsByUserIdAsync(authHeader);

      // Assert
      expect(queryBus.execute).toHaveBeenCalled();
    });
  });

  describe('markNotificationAsViewedAsync', () => {
    it('should call execute on the commandBus', async () => {
      // Arrange
      const notificationId = 1;
      const authHeader = 'bearer <token>';

      // Act
      await controller.markNotificationAsViewedAsync(
        notificationId,
        authHeader,
      );

      // Assert
      expect(commandBus.execute).toHaveBeenCalled();
    });
  });

  describe('deleteNotificationAsync', () => {
    it('should call execute on the commandBus', async () => {
      // Arrange
      const notificationId = 1;
      const authHeader = 'bearer <token>';

      // Act
      await controller.deleteNotificationAsync(notificationId, authHeader);

      // Assert
      expect(commandBus.execute).toHaveBeenCalled();
    });
  });
});
