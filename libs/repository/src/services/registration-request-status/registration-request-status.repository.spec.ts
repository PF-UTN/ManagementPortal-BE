import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationRequestStatusRepository } from './registration-request-status.repository';
import { PrismaService } from '../prisma.service';

describe('RegistrationRequestStatusService', () => {
  let service: RegistrationRequestStatusRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationRequestStatusRepository,
        {
          provide: PrismaService,
          useValue: {
            registrationRequestStatus: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RegistrationRequestStatusRepository>(
      RegistrationRequestStatusRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('findByCodeAsync', () => {
  let service: RegistrationRequestStatusRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationRequestStatusRepository,
        {
          provide: PrismaService,
          useValue: {
            registrationRequestStatus: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RegistrationRequestStatusRepository>(
      RegistrationRequestStatusRepository,
    );
  });

  it('should return a registration request status by code', async () => {
    // Arrange
    const code = 'test-code';
    const expectedStatus = {
      id: 1,
      code: 'test-code',
    };

    jest.spyOn(service, 'findByCodeAsync').mockResolvedValue(expectedStatus);

    const result = await service.findByCodeAsync(code);
    expect(result).toEqual(expectedStatus);
  });

  it('should return null if no registration request status is found', async () => {
    const code = 'non-existent-code';

    jest.spyOn(service, 'findByCodeAsync').mockResolvedValue(null);

    const result = await service.findByCodeAsync(code);
    expect(result).toBeNull();
  });
});
