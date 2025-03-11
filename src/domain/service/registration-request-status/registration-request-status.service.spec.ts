import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationRequestStatusService } from './registration-request-status.service';

describe('RegistrationRequestStatusService', () => {
  let service: RegistrationRequestStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegistrationRequestStatusService],
    }).compile();

    service = module.get<RegistrationRequestStatusService>(RegistrationRequestStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
