import { Injectable } from '@nestjs/common';

import { ClientRepository } from './../../../../libs/repository/src/services/client/client.repository';

@Injectable()
export class ClientService {
  constructor(private readonly clientRepository: ClientRepository) {}

  async findClientByIdAsync(clientId: number) {
    const client = await this.clientRepository.findClientByIdAsync(clientId);
    return client;
  }
  async findClientByUserIdAsync(userId: number) {
    return await this.clientRepository.findClientByUserIdAsync(userId);
  }
}
