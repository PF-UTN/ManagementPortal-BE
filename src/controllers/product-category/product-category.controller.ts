import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import { ProductCategoryCreationDto } from '@mp/common/dtos';

import { CreateProductCategoryCommand } from './command/create-product-category.command';
import { ProductCategoriesQuery } from './query/product-categories.query';

@Controller('product-category')
export class ProductCategoryController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

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

  @Post()
  @HttpCode(201)
  @RequiredPermissions(
    PermissionCodes.ProductCategory.CREATE,
    PermissionCodes.ProductCategory.UPDATE,
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create or update a product category',
    description: 'Creates a new product category or updates an existing one.',
  })
  async createOrUpdateProductCategoryAsync(
    @Body() productCategoryCreationDto: ProductCategoryCreationDto,
  ) {
    return this.commandBus.execute(
      new CreateProductCategoryCommand(productCategoryCreationDto),
    );
  }
}
