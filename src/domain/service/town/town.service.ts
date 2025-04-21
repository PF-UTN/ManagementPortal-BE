import { Injectable } from '@nestjs/common';

import { TownRepository } from '@mp/repository';

@Injectable()
export class TownService {
  constructor(private readonly townRepository: TownRepository) {}

  async searchTownsByTextAsync(searchText: string) {
    return await this.townRepository.searchTownsByTextAsync(searchText);
  }
}
