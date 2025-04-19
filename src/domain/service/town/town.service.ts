import { TownRepository } from '@mp/repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TownService {
  constructor(private readonly townRepository: TownRepository) {}

  async searchTownsByTextAsync(searchText: string) {
    return await this.townRepository.searchTownsByTextAsync(searchText);
  }
}
