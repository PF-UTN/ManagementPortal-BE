import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Notification, User } from '@prisma/client';
import { subMonths } from 'date-fns';
import { mockDeep } from 'jest-mock-extended';

import {
  MaintenancePlanItemRepository,
  NotificationRepository,
  UserRepository,
} from '@mp/repository';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let repository: NotificationRepository;
  let maintenancePlanItemRepository: MaintenancePlanItemRepository;
  let userRepository: UserRepository;
  let notification: ReturnType<typeof mockDeep<Notification>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: NotificationRepository,
          useValue: mockDeep(NotificationRepository),
        },
        {
          provide: MaintenancePlanItemRepository,
          useValue: mockDeep(MaintenancePlanItemRepository),
        },
        {
          provide: UserRepository,
          useValue: mockDeep(UserRepository),
        },
      ],
    }).compile();

    repository = module.get<NotificationRepository>(NotificationRepository);
    maintenancePlanItemRepository = module.get<MaintenancePlanItemRepository>(
      MaintenancePlanItemRepository,
    );
    userRepository = module.get<UserRepository>(UserRepository);

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

  describe('generateMaintenanceNotificationsAsync', () => {
    it('should generate notification based on km threshold', async () => {
      // Arrange
      const vehicle = {
        id: 1,
        brand: 'Toyota',
        model: 'Corolla',
        licensePlate: 'ABC123',
        kmTraveled: 9500,
        createdAt: new Date('2023-01-01'),
        deleted: false,
        admissionDate: new Date('2023-01-01'),
        enabled: true,
        updatedAt: new Date('2023-01-01'),
      };

      const maintenanceItem = { id: 1, description: 'Cambio de aceite' };

      const maintenancePlanItem = {
        id: 1,
        vehicle,
        vehicleId: vehicle.id,
        maintenanceItemId: maintenanceItem.id,
        maintenanceItem,
        kmInterval: 10000,
        timeInterval: null,
        maintenances: [
          {
            kmPerformed: 0,
            date: new Date(),
            id: 1,
            maintenancePlanItemId: 1,
            serviceSupplierId: 1,
          },
        ],
      };

      jest
        .spyOn(maintenancePlanItemRepository, 'findAllWithRelationsAsync')
        .mockResolvedValueOnce([maintenancePlanItem]);
      jest
        .spyOn(userRepository, 'findAdminsAsync')
        .mockResolvedValueOnce([{ id: 1 } as User]);
      jest
        .spyOn(repository, 'existsSimilarNotificationAsync')
        .mockResolvedValueOnce(null);

      // Act
      await service.generateMaintenanceNotificationsAsync();

      // Assert
      expect(repository.createAsync).toHaveBeenCalledTimes(1);
      expect(repository.createAsync).toHaveBeenCalledWith(
        1,
        expect.stringContaining('Cambio de aceite'),
      );
    });

    it('should generate notification based on time threshold', async () => {
      const vehicle = {
        id: 1,
        brand: 'Ford',
        model: 'Focus',
        licensePlate: 'XYZ987',
        kmTraveled: 10000,
        createdAt: new Date('2023-01-01'),
        deleted: false,
        admissionDate: new Date('2023-01-01'),
        enabled: true,
        updatedAt: new Date('2023-01-01'),
      };

      const maintenanceItem = { id: 1, description: 'Cambio de filtros' };

      const lastDate = subMonths(new Date(), 5.8);

      const maintenancePlanItem = {
        id: 2,
        vehicle,
        vehicleId: vehicle.id,
        maintenanceItemId: maintenanceItem.id,
        maintenanceItem,
        kmInterval: null,
        timeInterval: 6,
        maintenances: [
          {
            kmPerformed: 10000,
            date: lastDate,
            id: 1,
            maintenancePlanItemId: 1,
            serviceSupplierId: 1,
          },
        ],
      };

      jest
        .spyOn(maintenancePlanItemRepository, 'findAllWithRelationsAsync')
        .mockResolvedValueOnce([maintenancePlanItem]);
      jest
        .spyOn(userRepository, 'findAdminsAsync')
        .mockResolvedValueOnce([{ id: 1 } as User]);
      jest
        .spyOn(repository, 'existsSimilarNotificationAsync')
        .mockResolvedValueOnce(null);

      await service.generateMaintenanceNotificationsAsync();

      expect(repository.createAsync).toHaveBeenCalledWith(
        1,
        expect.stringContaining('Cambio de filtros'),
      );
    });
  });
});
