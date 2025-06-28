import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';

@Injectable()
export class TownRepository {
    constructor(private readonly prisma: PrismaService) {}

    async searchTownsByTextAsync(text: string) {
        return this.prisma.town.findMany({
          where: text
            ? {
              OR: [
                { name: { contains: text, mode: 'insensitive' } }, 
                { zipCode: { contains: text, mode: 'insensitive' } }, 
              ],
  
              }
            : {}, 
          orderBy: {
            name: 'asc',
          },
        });
      }

    async searchWithFiltersAsync(
      searchText: string,
      page: number,
      pageSize: number,
    ) {
      const [data, total] = await Promise.all([
        this.prisma.town.findMany({
          where: {
            OR: [
              { name: { contains: searchText, mode: 'insensitive' } },
              { zipCode: { contains: searchText, mode: 'insensitive' } },
            ]
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: {
            name: 'asc',
          },
        }),
        this.prisma.town.count({
          where: {
            OR: [
              { name: { contains: searchText, mode: 'insensitive' } },
              { zipCode: { contains: searchText, mode: 'insensitive' } },
            ]
          },
        }),
      ]);
  
      return { data, total };
    }

    async existsAsync(id: number): Promise<boolean> {
      const town = await this.prisma.town.findUnique({
        where: { id },
      });
      return !!town;
    }
}