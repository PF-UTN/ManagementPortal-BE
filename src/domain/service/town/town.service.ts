import { Injectable } from '@nestjs/common';

import { TownRepository } from '@mp/repository';

@Injectable()
export class TownService {
  constructor(private readonly townRepository: TownRepository) {}

  async searchTownsByTextAsync(searchText: string) {
    return await this.townRepository.searchTownsByTextAsync(searchText);
  }

  async checkIfExistsByIdAsync(id: number): Promise<boolean> {
    return this.townRepository.checkIfExistsByIdAsync(id);
  }
}
