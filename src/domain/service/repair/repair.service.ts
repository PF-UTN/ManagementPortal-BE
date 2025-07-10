import { Injectable, NotFoundException } from '@nestjs/common';

import { RepairRepository } from '@mp/repository';

@Injectable()
export class RepairService {
  constructor(private readonly repairRepository: RepairRepository) {}

  async deleteRepairAsync(id: number) {
    const existsRepair = await this.repairRepository.existsAsync(id);

    if (!existsRepair) {
      throw new NotFoundException(`Repair with id ${id} does not exist.`);
    }

    return await this.repairRepository.deleteRepairAsync(id);
  }
}
