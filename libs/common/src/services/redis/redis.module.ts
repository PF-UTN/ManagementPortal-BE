import { Module, Global } from '@nestjs/common';
import { createClient } from 'redis';

const redisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: async () => {
    const client = createClient({ url: process.env.REDIS_URL });
    client.on('error', err => console.log('Redis Client Error', err));
    await client.connect();
    return client;
  },
};

@Global()
@Module({
  providers: [redisProvider],
  exports: [redisProvider],
})
export class RedisModule {}