import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma.service";

@Injectable()
export class ProductCategoryRepository {
    constructor(private readonly prisma: PrismaService) {}
    
    async getProductCategoryAsync() {
        return this.prisma.productCategory.findMany({
            orderBy: {
                name: "asc",
            },
        });
    }
}
