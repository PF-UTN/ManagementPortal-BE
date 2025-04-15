import { ProvinceRepository } from '@mp/repository'; 
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProvinceService {
  constructor(
    private readonly provinceRepository: ProvinceRepository 
  ) {}

  async getProvincesByIdAsync(countryId: number) {
    return await this.provinceRepository.findProvincesByIdAsync(countryId);
  }
}