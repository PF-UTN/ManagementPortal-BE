import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { BCRYPT_ROUNDS } from './encryption.constants';

@Injectable()
export class EncryptionService {
  private readonly rounds: number = Number(BCRYPT_ROUNDS);

  async hashAsync(password: string): Promise<string> {
    const salt = await this.genSaltAsync(this.rounds);
    return bcrypt.hash(password, salt);
  }

  async compareAsync(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async genSaltAsync(rounds: number): Promise<string> {
    return bcrypt.genSalt(rounds);
  }
}
