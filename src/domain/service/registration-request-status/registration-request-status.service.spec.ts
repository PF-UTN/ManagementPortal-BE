import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationRequestStatusRepository } from '@mp/repository';
import { RegistrationRequestStatusRepositoryMock } from '@mp/common/testing';
import { RegistrationRequestStatusService } from './registration-request-status.service';

describe('RegistrationRequestStatusService', () => {
  let service: RegistrationRequestStatusService;
  let registrationRequestStatusRepositoryMock: RegistrationRequestStatusRepositoryMock;

  beforeEach(async () => {
    registrationRequestStatusRepositoryMock = new RegistrationRequestStatusRepositoryMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationRequestStatusService,
        { provide: RegistrationRequestStatusRepository, useValue: registrationRequestStatusRepositoryMock}
      ],
    }).compile();

    service = module.get<RegistrationRequestStatusService>(
      RegistrationRequestStatusService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByCodeAsync', () => {
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
        .spyOn(
          service['registrationRequestStatusRepository'],
          'findByCodeAsync',
        )
        .mockResolvedValue(expectedResult);

      // Act
      const result = await service.findByCodeAsync(code);
      // Assert
      expect(result).toEqual(expectedResult);
    });
  });
});
