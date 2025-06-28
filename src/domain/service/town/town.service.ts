import { Injectable } from '@nestjs/common';

import { TownRepository } from '@mp/repository';

import { SearchTownQuery } from '../../../controllers/town/query/search-town-query';

@Injectable()
export class TownService {
  constructor(private readonly townRepository: TownRepository) {}

  async searchTownsByTextAsync(searchText: string) {
    return await this.townRepository.searchTownsByTextAsync(searchText);
  }

  async searchWithFiltersAsync(query: SearchTownQuery) {
    return await this.townRepository.searchWithFiltersAsync(
      query.searchText,
      query.page,
      query.pageSize,
    );
  }

  async existsAsync(id: number): Promise<boolean> {
    return this.townRepository.existsAsync(id);
  }
}
