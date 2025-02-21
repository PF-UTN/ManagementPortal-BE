import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { UserServiceModule } from '../user/user.service.module';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserServiceModule],
      providers: [AuthenticationService],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
