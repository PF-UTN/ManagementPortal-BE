import { Injectable } from '@nestjs/common';

import { SearchProductFiltersDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductRepository {
    constructor(private readonly prisma: PrismaService) { }

    async searchWithFiltersAsync(
        searchText: string,
        filters: SearchProductFiltersDto,
        page: number,
        pageSize: number,
    ) {
        const [data, total] = await Promise.all([
            this.prisma.product.findMany({
                where: {
                    AND: [
                        filters.enabled !== undefined ? { enabled: filters.enabled } : {},
                        filters.categoryDescriptions?.length
                            ? {
                                category: {
                                    is: {
                                        description: { in: filters.categoryDescriptions },
                                    },
                                },
                            }
                            : {},
                        filters.providerDescription?.length
                            ? {
                                supplier: {
                                    is: {
                                        businessName: { in: filters.providerDescription },
                                    },
                                },
                            }
                            : {},
                        {
                            OR: [
                                {
                                    name: {
                                        contains: searchText,
                                        mode: 'insensitive',
                                    },
                                },
                                {
                                    description: {
                                        contains: searchText,
                                        mode: 'insensitive',
                                    },
                                },
                            ],
                        },
                    ],
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { name: 'asc' },
            }),
            this.prisma.product.count({
                where: {
                    AND: [
                        filters.enabled !== undefined ? { enabled: filters.enabled } : {},
                        filters.categoryDescriptions?.length
                            ? {
                                category: {
                                    is: {
                                        description: { in: filters.categoryDescriptions },
                                    },
                                },
                            }
                            : {},
                        filters.providerDescription?.length
                            ? {
                                supplier: {
                                    is: {
                                        businessName: { in: filters.providerDescription },
                                    },
                                },
                            }
                            : {},
                        {
                            OR: [
                                {
                                    name: {
                                        contains: searchText,
                                        mode: 'insensitive',
                                    },
                                },
                                {
                                    description: {
                                        contains: searchText,
                                        mode: 'insensitive',
                                    },
                                },
                            ],
                        },
                    ],
                },
            }),
        ]);

        return { data, total };
    }

}