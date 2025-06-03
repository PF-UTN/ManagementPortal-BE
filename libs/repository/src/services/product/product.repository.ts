import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

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
                        filters.categoryName?.length
                            ? {
                                category: {
                                    is: {
                                        name: { in: filters.categoryName },
                                    },
                                },
                            }
                            : {},
                        filters.supplierBusinessName?.length
                            ? {
                                supplier: {
                                    is: {
                                        businessName: { in: filters.supplierBusinessName },
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
                include: {
                    category: {
                        select: {
                            name: true,
                            description: true,
                        },
                    },
                    supplier: {
                        select: {
                            businessName: true,
                        },
                    },
                    stock: {
                        select: {
                            quantityAvailable: true,
                        },
                    },
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { name: 'asc' },
            }),
            this.prisma.product.count({
                where: {
                    AND: [
                        filters.enabled !== undefined ? { enabled: filters.enabled } : {},
                        filters.categoryName?.length
                            ? {
                                category: {
                                    is: {
                                        description: { in: filters.categoryName },
                                    },
                                },
                            }
                            : {},
                        filters.supplierBusinessName?.length
                            ? {
                                supplier: {
                                    is: {
                                        businessName: { in: filters.supplierBusinessName },
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

    async createProductAsync(data: Prisma.ProductCreateInput, tx?: Prisma.TransactionClient) { // tipar retorno, ver si lo que devuelvo es correcto
        const client = tx ?? this.prisma;
        return client.product.create({
            data,
            include: {
                category: {
                    select: {
                        name: true,
                        description: true,
                    },
                },
                supplier: {
                    select: {
                        businessName: true,
                    },
                },
            },
        });
    }

}