import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationRequestRepository } from './registration-request.repository';

describe('RegistrationRequestService', () => {
  let service: RegistrationRequestRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegistrationRequestRepository],
    }).compile();

    service = module.get<RegistrationRequestRepository>(RegistrationRequestRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
