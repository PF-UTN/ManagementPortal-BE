import { Injectable, NotFoundException } from '@nestjs/common';

import { ClientAddressDto } from '@mp/common/dtos';

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

  async findClientAddressByUserIdAsync(userId: number) {
    const client =
      await this.clientRepository.findClientAddressByUserIdAsync(userId);
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const clientAddress: ClientAddressDto = {
      id: client.id,
      address: {
        street: client.address.street,
        streetNumber: client.address.streetNumber,
        town: {
          name: client.address.town.name,
          zipCode: client.address.town.zipCode,
          province: {
            name: client.address.town.province.name,
            country: {
              name: client.address.town.province.country.name,
            },
          },
        },
      },
    };
    return clientAddress;
  }
}
