import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ProductCreationDataDto, SearchProductFiltersDto } from '@mp/common/dtos';

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

    async createProductAsync(data: ProductCreationDataDto, tx?: Prisma.TransactionClient) {
        const { categoryId, supplierId, ...productData } = data
        const client = tx ?? this.prisma;
        return client.product.create({
            data: {
                ...productData,
                category: {
                    connect: { id: categoryId }
                },
                supplier: {
                    connect: { id: supplierId }
                }
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
            },
        });
    }
    
    async updateProductAsync(id: number, data: ProductCreationDataDto) {
        const { categoryId, supplierId, ...productData } = data;
        return this.prisma.product.update({
            where: { id },
            data: {
                ...productData,
                category: {
                    connect: { id: categoryId }
                },
                supplier: {
                    connect: { id: supplierId }
                }
            },
        });
    }

    async updateEnabledProductAsync(id: number, enabled: boolean) {
        return this.prisma.product.update({
            where: { id },
            data: { enabled },
        });
    }

    async existsAsync(id: number): Promise<boolean> {
    const product = await this.prisma.product.findUnique({
      select: { id: true },
      where: { id },
    });
    return !!product;
    }

    async findProductWithDetailsByIdAsync(productId: number) {
        return this.prisma.product.findUnique({
            where: { id: productId },
            include: {
                category: {
                    select: {
                        name: true,
                    },
                },
                supplier: {
                    select: {
                        businessName: true,
                        email: true,
                        phone: true,
                    },
                },
                stock: {
                    select: {
                        quantityAvailable: true,
                        quantityReserved: true,
                        quantityOrdered: true,
                    },
                },
            },
        });
    }

}