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

    async existsAsync(id: number): Promise<boolean> {
      const town = await this.prisma.town.findUnique({
        where: { id },
      });
      return !!town;
    }
}