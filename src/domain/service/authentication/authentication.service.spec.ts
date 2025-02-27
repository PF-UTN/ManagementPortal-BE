import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { UserServiceModule } from '../user/user.service.module';
import { JwtModule } from '@nestjs/jwt';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserServiceModule, JwtModule],
      providers: [AuthenticationService],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
