import { RegistrationRequestStatus } from '@mp/common/constants';
import { MailingService } from '@mp/common/services';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ApproveRegistrationRequestCommand } from './approve-registration-request.command';
import { ApproveRegistrationRequestCommandHandler } from './approve-registration-request.command.handler';
import { RegistrationRequestDomainService } from '../../../domain/service/registration-request/registration-request-domain.service';
import { RegistrationRequestStatusService } from '../../../domain/service/registration-request-status/registration-request-status.service';
import { UserService } from '../../../domain/service/user/user.service';

describe('ApproveRegistrationRequestCommandHandler', () => {
  let handler: ApproveRegistrationRequestCommandHandler;
  let registrationRequestService: RegistrationRequestDomainService;
  let registrationRequestStatusService: RegistrationRequestStatusService;
  let userService: UserService;
  let mailingService: MailingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApproveRegistrationRequestCommandHandler,
        {
          provide: RegistrationRequestDomainService,
          useValue: {
            findRegistrationRequestByIdAsync: jest.fn(),
            updateRegistrationRequestStatusAsync: jest.fn(),
          },
        },
        {
          provide: RegistrationRequestStatusService,
          useValue: {
            findByCodeAsync: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findByIdAsync: jest.fn(),
          },
        },
        {
          provide: MailingService,
          useValue: {
            sendRegistrationRequestApprovedEmailAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<ApproveRegistrationRequestCommandHandler>(
      ApproveRegistrationRequestCommandHandler,
    );
    registrationRequestService = module.get<RegistrationRequestDomainService>(
      RegistrationRequestDomainService,
    );
    registrationRequestStatusService =
      module.get<RegistrationRequestStatusService>(
        RegistrationRequestStatusService,
      );
    userService = module.get<UserService>(UserService);
    mailingService = module.get<MailingService>(MailingService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should throw NotFoundException if registration request does not exist', async () => {
    // Arrange
    jest
      .spyOn(registrationRequestService, 'findRegistrationRequestByIdAsync')
      .mockResolvedValue(null);

    // Act
    const command = new ApproveRegistrationRequestCommand(123, {});

    // Assert
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if registration request is not pending', async () => {
    // Arrange
    jest
      .spyOn(registrationRequestService, 'findRegistrationRequestByIdAsync')
      .mockResolvedValue({
        id: 123,
        statusId: 2,
        status: { id: 2, code: RegistrationRequestStatus.Approved },
        userId: 123,
        note: 'Test note',
        requestDate: new Date(),
      });

    // Act
    const command = new ApproveRegistrationRequestCommand(123, {
      note: 'Test note',
    });

    // Assert
    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('should update registration request status when registration request is approved', async () => {
    // Arrange
    jest
      .spyOn(registrationRequestService, 'findRegistrationRequestByIdAsync')
      .mockResolvedValue({
        id: 1,
        statusId: 1,
        status: { id: 1, code: RegistrationRequestStatus.Pending },
        userId: 1,
        note: 'Test note',
        requestDate: new Date(),
      });
    jest
      .spyOn(registrationRequestStatusService, 'findByCodeAsync')
      .mockResolvedValue({ id: 2, code: RegistrationRequestStatus.Approved });
    jest
      .spyOn(registrationRequestService, 'updateRegistrationRequestStatusAsync')
      .mockResolvedValue({
        id: 1,
        note: 'Test note',
        requestDate: new Date(),
        statusId: 2,
        userId: 1,
      });
    jest.spyOn(userService, 'findByIdAsync').mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      firstName: 'Test First Name',
      lastName: 'Test Last Name',
      password: 'testPassword',
      phone: '1234567890',
      documentNumber: '123456789',
      documentType: 'DNI',
      roleId: 1,
    });

    // Act
    const command = new ApproveRegistrationRequestCommand(1, {
      note: 'Test note',
    });

    // Assert
    await expect(handler.execute(command)).resolves.not.toThrow();

    expect(
      registrationRequestService.updateRegistrationRequestStatusAsync,
    ).toHaveBeenCalled();
  });

  it('should send email when registration request is approved', async () => {
    jest
      .spyOn(registrationRequestService, 'findRegistrationRequestByIdAsync')
      .mockResolvedValue({
        id: 123,
        statusId: 1,
        status: { id: 1, code: RegistrationRequestStatus.Pending },
        userId: 123,
        note: 'Test note',
        requestDate: new Date(),
      });
    jest
      .spyOn(registrationRequestStatusService, 'findByCodeAsync')
      .mockResolvedValue({ id: 2, code: RegistrationRequestStatus.Approved });
    jest
      .spyOn(registrationRequestService, 'updateRegistrationRequestStatusAsync')
      .mockResolvedValue({
        id: 123,
        note: 'Test note',
        requestDate: new Date(),
        statusId: 2,
        userId: 123,
      });
    jest.spyOn(userService, 'findByIdAsync').mockResolvedValue({
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'hashedPassword',
      phone: '1234567890',
      documentNumber: '123456789',
      documentType: 'DNI',
      roleId: 1,
    });
    jest
      .spyOn(mailingService, 'sendRegistrationRequestApprovedEmailAsync')
      .mockResolvedValue(undefined);

    const command = new ApproveRegistrationRequestCommand(123, {
      note: 'Test note',
    });
    await expect(handler.execute(command)).resolves.not.toThrow();

    expect(userService.findByIdAsync).toHaveBeenCalledWith(123);
    expect(
      mailingService.sendRegistrationRequestApprovedEmailAsync,
    ).toHaveBeenCalledWith('test@example.com');
  });
});
