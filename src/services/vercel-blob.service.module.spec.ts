import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { VercelBlobService } from './vercel-blob.service';
import { VercelBlobServiceModule } from './vercel-blob.service.module';

describe('VercelBlobServiceModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        VercelBlobServiceModule,
      ],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide VercelBlobService', () => {
    // Act
    const service = module.get<VercelBlobService>(VercelBlobService);

    // Assert
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(VercelBlobService);
  });

  it('should export VercelBlobService', () => {
    // Act
    const service = module.get<VercelBlobService>(VercelBlobService);

    // Assert
    expect(service).toBeDefined();
  });
});
