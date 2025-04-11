import { Injectable } from '@nestjs/common';
import { Country } from '@prisma/client';
import { PrismaService } from '../prisma.service';


@Injectable()
export class CountryRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAllAsync(): Promise<Country[] | null> {
        return this.prisma.country.findMany();
    }
}