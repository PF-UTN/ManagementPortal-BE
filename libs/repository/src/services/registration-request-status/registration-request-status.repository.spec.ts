import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationRequestStatusRepository } from './registration-request-status.repository';

describe('RegistrationRequestStatusService', () => {
  let service: RegistrationRequestStatusRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegistrationRequestStatusRepository],
    }).compile();

    service = module.get<RegistrationRequestStatusRepository>(RegistrationRequestStatusRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
