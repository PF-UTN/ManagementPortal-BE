import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';

@Injectable()
export class CountryRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAllAsync() {
        return this.prisma.country.findMany();
    }
}