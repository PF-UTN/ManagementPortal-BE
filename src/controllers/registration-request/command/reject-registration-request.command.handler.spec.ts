import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RegistrationRequestStatus } from '@mp/common/constants';
import { MailingService } from '@mp/common/services';
import { RegistrationRequestDomainService } from '../../../domain/service/registration-request/registration-request-domain.service';
import { RejectRegistrationRequestCommandHandler } from './reject-registration-request.command.handler';
import { RegistrationRequestStatusService } from '../../../domain/service/registration-request-status/registration-request-status.service';
import { UserService } from '../../../domain/service/user/user.service';
import { RejectRegistrationRequestCommand } from './reject-registration-request.command';

describe('RejectRegistrationRequestCommandHandler', () => {
  let handler: RejectRegistrationRequestCommandHandler;

  const mockRegistrationRequestService = {
    findRegistrationRequestByIdAsync: jest.fn(),
    updateRegistrationRequestStatusAsync: jest.fn(),
  };

  const mockRegistrationRequestStatusService = {
    findByCodeAsync: jest.fn(),
  };

  const mockUserService = {
    findByIdAsync: jest.fn(),
  };

  const mockMailingService = {
    sendRegistrationRequestRejectedEmailAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RejectRegistrationRequestCommandHandler,
        {
          provide: RegistrationRequestDomainService,
          useValue: mockRegistrationRequestService,
        },
        {
          provide: RegistrationRequestStatusService,
          useValue: mockRegistrationRequestStatusService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: MailingService,
          useValue: mockMailingService,
        },
      ],
    }).compile();

    handler = module.get<RejectRegistrationRequestCommandHandler>(
      RejectRegistrationRequestCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should throw NotFoundException if registration request does not exist', async () => {
    // Arrange
    jest
      .spyOn(mockRegistrationRequestService, 'findRegistrationRequestByIdAsync')
      .mockResolvedValue(null);

    // Act
    const command = new RejectRegistrationRequestCommand(123, { note: 'test' });

    // Assert
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if registration request status is not pending', async () => {
    // Arrange
    jest
      .spyOn(mockRegistrationRequestService, 'findRegistrationRequestByIdAsync')
      .mockResolvedValue({ status: { code: 'Approved' } });

    // Act
    const command = new RejectRegistrationRequestCommand(123, { note: 'test' });

    // Assert
    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('should update registration request status when registration request is rejected', async () => {
    // Arrange
    const registrationRequest = {
      status: { code: 'Pending' },
      userId: 1,
    };
    jest
      .spyOn(mockRegistrationRequestService, 'findRegistrationRequestByIdAsync')
      .mockResolvedValue(registrationRequest);
    jest
      .spyOn(mockRegistrationRequestStatusService, 'findByCodeAsync')
      .mockResolvedValue({ id: 3 });
    jest
      .spyOn(
        mockRegistrationRequestService,
        'updateRegistrationRequestStatusAsync',
      )
      .mockResolvedValue(registrationRequest);

    jest.spyOn(mockUserService, 'findByIdAsync').mockResolvedValue({ id: 1 });

    const command = new RejectRegistrationRequestCommand(1, { note: 'test' });

    // Act
    await handler.execute(command);

    // Assert
    expect(
      mockRegistrationRequestService.updateRegistrationRequestStatusAsync,
    ).toHaveBeenCalledWith({
      registrationRequestId: 1,
      status: { connect: { id: 3 } },
      note: 'test',
    });
  });

  it('should send email to user when registration request is rejected', async () => {
    // Arrange
    jest
      .spyOn(mockRegistrationRequestService, 'findRegistrationRequestByIdAsync')
      .mockResolvedValue({
        id: 1,
        statusId: 1,
        status: { id: 1, code: RegistrationRequestStatus.Pending },
        userId: 1,
        note: 'Test note',
        requestDate: new Date(),
      });

    jest
      .spyOn(mockRegistrationRequestStatusService, 'findByCodeAsync')
      .mockResolvedValue({
        id: 3,
        code: RegistrationRequestStatus.Rejected,
      });

    jest
      .spyOn(
        mockRegistrationRequestService,
        'updateRegistrationRequestStatusAsync',
      )
      .mockResolvedValue({
        id: 1,
        statusId: 3,
        userId: 1,
      });

    jest.spyOn(mockUserService, 'findByIdAsync').mockResolvedValue({
      id: 1,
      email: 'test@example.com',
    });

    jest
      .spyOn(mockMailingService, 'sendRegistrationRequestRejectedEmailAsync')
      .mockResolvedValue(undefined);

    const command = new RejectRegistrationRequestCommand(1, {
      note: 'Test note',
    });

    // Act
    await handler.execute(command);

    // Assert
    expect(
      mockMailingService.sendRegistrationRequestRejectedEmailAsync,
    ).toHaveBeenCalledWith('test@example.com', 'Test note');
  });
});
