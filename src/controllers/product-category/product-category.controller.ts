import { Controller, Get, HttpCode} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation} from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';

import { ProductCategoriesQuery } from './query/product-categories.query';

@Controller('product-categories')
export class ProductCategoryController {
    constructor(private readonly queryBus: QueryBus) {}
    
    @Get()
    @HttpCode(200)
    @RequiredPermissions(PermissionCodes.ProductCategory.READ)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Retrieve product categories',
        description: 'Fetches all product categories available.',
    })
    async getProductCategoriesAsync() {
        return this.queryBus.execute(new ProductCategoriesQuery());
    }
    }