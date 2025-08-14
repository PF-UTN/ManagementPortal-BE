import { Injectable } from '@nestjs/common';

import { MaintenancePlanItemCreationDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';

@Injectable()
export class MaintenancePlanItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMaintenancePlanItemAsync(
    maintenancePlanItemCreationDto: MaintenancePlanItemCreationDto,
  ) {
    return this.prisma.maintenancePlanItem.create({
      data: maintenancePlanItemCreationDto,
    });
  }
}
