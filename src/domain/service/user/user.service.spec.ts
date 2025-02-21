import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { UserRepository } from '../../../libs/repository/user.repository';
import { PrismaService } from '../../../prisma.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, UserRepository, PrismaService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
