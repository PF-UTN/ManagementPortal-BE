import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';

@Injectable()
export class ProvinceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findProvincesByIdAsync(
    countryId: number,
  ) {
    return this.prisma.province.findMany({
      where: { id: countryId },
    });
  }
}
