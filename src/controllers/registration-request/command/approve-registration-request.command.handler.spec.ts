import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MailingService } from '@mp/common/services';
import { RegistrationRequestStatus } from '@mp/common/constants';
import {
  MailingServiceMock,
  RegistrationRequestDomainServiceMock,
  RegistrationRequestStatusServiceMock,
  UserServiceMock,
} from '@mp/common/testing';
import { ApproveRegistrationRequestCommandHandler } from './approve-registration-request.command.handler';
import { ApproveRegistrationRequestCommand } from './approve-registration-request.command';
import { RegistrationRequestStatusService } from '../../../domain/service/registration-request-status/registration-request-status.service';
import { RegistrationRequestDomainService } from '../../../domain/service/registration-request/registration-request-domain.service';
import { UserService } from '../../../domain/service/user/user.service';

describe('ApproveRegistrationRequestCommandHandler', () => {
  let handler: ApproveRegistrationRequestCommandHandler;
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
        ApproveRegistrationRequestCommandHandler,
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

    handler = module.get<ApproveRegistrationRequestCommandHandler>(
      ApproveRegistrationRequestCommandHandler,
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
    const command = new ApproveRegistrationRequestCommand(123, {});

    // Assert
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if registration request is not pending', async () => {
    // Arrange
    jest
      .spyOn(registrationRequestServiceMock, 'findRegistrationRequestByIdAsync')
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
      .mockResolvedValue({ id: 2, code: RegistrationRequestStatus.Approved });
    jest
      .spyOn(
        registrationRequestServiceMock,
        'updateRegistrationRequestStatusAsync',
      )
      .mockResolvedValue({
        id: 1,
        note: 'Test note',
        requestDate: new Date(),
        statusId: 2,
        userId: 1,
      });
    jest.spyOn(userServiceMock, 'findByIdAsync').mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      firstName: 'Test First Name',
      lastName: 'Test Last Name',
      password: 'testPassword',
      phone: '1234567890',
      documentNumber: '123456789',
      documentType: 'DNI',
    });

    // Act
    const command = new ApproveRegistrationRequestCommand(1, {
      note: 'Test note',
    });

    // Assert
    await expect(handler.execute(command)).resolves.not.toThrow();

    expect(
      registrationRequestServiceMock.updateRegistrationRequestStatusAsync,
    ).toHaveBeenCalled();
  });

  it('should send email when registration request is approved', async () => {
    jest
      .spyOn(registrationRequestServiceMock, 'findRegistrationRequestByIdAsync')
      .mockResolvedValue({
        id: 123,
        statusId: 1,
        status: { id: 1, code: RegistrationRequestStatus.Pending },
        userId: 123,
        note: 'Test note',
        requestDate: new Date(),
      });
    jest
      .spyOn(registrationRequestStatusServiceMock, 'findByCodeAsync')
      .mockResolvedValue({ id: 2, code: RegistrationRequestStatus.Approved });
    jest
      .spyOn(
        registrationRequestServiceMock,
        'updateRegistrationRequestStatusAsync',
      )
      .mockResolvedValue({
        id: 123,
        note: 'Test note',
        requestDate: new Date(),
        statusId: 2,
        userId: 123,
      });
    jest.spyOn(userServiceMock, 'findByIdAsync').mockResolvedValue({
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'hashedPassword',
      phone: '1234567890',
      documentNumber: '123456789',
      documentType: 'DNI',
    });
    jest
      .spyOn(mailingServiceMock, 'sendRegistrationRequestApprovedEmailAsync')
      .mockResolvedValue(undefined);

    const command = new ApproveRegistrationRequestCommand(123, {
      note: 'Test note',
    });
    await expect(handler.execute(command)).resolves.not.toThrow();

    expect(userServiceMock.findByIdAsync).toHaveBeenCalledWith(123);
    expect(
      mailingServiceMock.sendRegistrationRequestApprovedEmailAsync,
    ).toHaveBeenCalledWith('test@example.com');
  });
});
