import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationRequestStatusRepository } from '@mp/repository';
import { RegistrationRequestStatusService } from './registration-request-status.service';

describe('RegistrationRequestStatusService', () => {
  let service: RegistrationRequestStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationRequestStatusService,
        {
          provide: RegistrationRequestStatusRepository,
          useValue: {
            findByCodeAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RegistrationRequestStatusService>(
      RegistrationRequestStatusService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('findByCodeAsync', () => {
  let service: RegistrationRequestStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationRequestStatusService,
        {
          provide: RegistrationRequestStatusRepository,
          useValue: {
            findByCodeAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RegistrationRequestStatusService>(
      RegistrationRequestStatusService,
    );
  });
  it('should call findByCodeAsync with correct code', async () => {
    // Arrange
    const code = 'testCode';
    // Act
    await service.findByCodeAsync(code);
    // Assert
    expect(
      service['registrationRequestStatusRepository'].findByCodeAsync,
    ).toHaveBeenCalledWith(code);
  });

  it('should return the result from findByCodeAsync', async () => {
    // Arrange
    const code = 'testCode';
    const expectedResult = { id: 1, code: 'testCode' };
    jest
      .spyOn(service['registrationRequestStatusRepository'], 'findByCodeAsync')
      .mockResolvedValue(expectedResult);

    // Act
    const result = await service.findByCodeAsync(code);
    // Assert
    expect(result).toEqual(expectedResult);
  });
});
