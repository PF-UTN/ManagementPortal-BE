import { RegistrationRequestStatus } from '@mp/common/constants';
import { MailingService } from '@mp/common/services';
import {
  MailingServiceMock,
  RegistrationRequestDomainServiceMock,
  RegistrationRequestStatusServiceMock,
  UserServiceMock,
} from '@mp/common/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { RejectRegistrationRequestCommand } from './reject-registration-request.command';
import { RejectRegistrationRequestCommandHandler } from './reject-registration-request.command.handler';
import { RegistrationRequestDomainService } from '../../../domain/service/registration-request/registration-request-domain.service';
import { RegistrationRequestStatusService } from '../../../domain/service/registration-request-status/registration-request-status.service';
import { UserService } from '../../../domain/service/user/user.service';

describe('RejectRegistrationRequestCommandHandler', () => {
  let handler: RejectRegistrationRequestCommandHandler;
  let registrationRequestServiceMock: RegistrationRequestDomainServiceMock;
  let registrationRequestStatusServiceMock: RegistrationRequestStatusServiceMock;
  let userServiceMock: UserServiceMock;
  let mailingServiceMock: MailingServiceMock;

  beforeEach(async () => {
    registrationRequestServiceMock = new RegistrationRequestDomainServiceMock();
    registrationRequestStatusServiceMock =
      new RegistrationRequestStatusServiceMock();
    userServiceMock = new UserServiceMock();
    mailingServiceMock = new MailingServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RejectRegistrationRequestCommandHandler,
        {
          provide: RegistrationRequestDomainService,
          useValue: registrationRequestServiceMock,
        },
        {
          provide: RegistrationRequestStatusService,
          useValue: registrationRequestStatusServiceMock,
        },
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: MailingService,
          useValue: mailingServiceMock,
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
      .spyOn(registrationRequestServiceMock, 'findRegistrationRequestByIdAsync')
      .mockResolvedValue(null);

    // Act
    const command = new RejectRegistrationRequestCommand(123, { note: 'test' });

    // Assert
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if registration request status is not pending', async () => {
    // Arrange
    jest
      .spyOn(registrationRequestServiceMock, 'findRegistrationRequestByIdAsync')
      .mockResolvedValue({ status: { code: 'Approved' } });

    // Act
    const command = new RejectRegistrationRequestCommand(123, { note: 'test' });

    // Assert
    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('should update registration request status when registration request is rejected', async () => {
    // Arrange
    const registrationRequest = {
      statusId: 1,
      userId: 1,
    };
    jest
      .spyOn(registrationRequestServiceMock, 'findRegistrationRequestByIdAsync')
      .mockResolvedValue(registrationRequest);
    jest
      .spyOn(registrationRequestStatusServiceMock, 'findByCodeAsync')
      .mockResolvedValue({ id: 3 });
    jest
      .spyOn(
        registrationRequestServiceMock,
        'updateRegistrationRequestStatusAsync',
      )
      .mockResolvedValue(registrationRequest);

    jest.spyOn(userServiceMock, 'findByIdAsync').mockResolvedValue({ id: 1 });

    const command = new RejectRegistrationRequestCommand(1, { note: 'test' });

    // Act
    await handler.execute(command);

    // Assert
    expect(
      registrationRequestServiceMock.updateRegistrationRequestStatusAsync,
    ).toHaveBeenCalledWith({
      registrationRequestId: 1,
      status: { connect: { id: 3 } },
      note: 'test',
    });
  });

  it('should send email to user when registration request is rejected', async () => {
    // Arrange
    jest
      .spyOn(registrationRequestServiceMock, 'findRegistrationRequestByIdAsync')
      .mockResolvedValue({
        id: 1,
        statusId: 1,
        status: { id: 1, code: RegistrationRequestStatus.Pending },
        userId: 1,
        note: 'Test note',
        requestDate: new Date(),
      });

    jest
      .spyOn(registrationRequestStatusServiceMock, 'findByCodeAsync')
      .mockResolvedValue({
        id: 3,
        code: RegistrationRequestStatus.Rejected,
      });

    jest
      .spyOn(
        registrationRequestServiceMock,
        'updateRegistrationRequestStatusAsync',
      )
      .mockResolvedValue({
        id: 1,
        statusId: 3,
        userId: 1,
      });

    jest.spyOn(userServiceMock, 'findByIdAsync').mockResolvedValue({
      id: 1,
      email: 'test@example.com',
    });

    jest
      .spyOn(mailingServiceMock, 'sendRegistrationRequestRejectedEmailAsync')
      .mockResolvedValue(undefined);

    const command = new RejectRegistrationRequestCommand(1, {
      note: 'Test note',
    });

    // Act
    await handler.execute(command);

    // Assert
    expect(
      mailingServiceMock.sendRegistrationRequestRejectedEmailAsync,
    ).toHaveBeenCalledWith('test@example.com', 'Test note');
  });
});
