import {
  Controller,
  Post,
  Body,
  HttpCode,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import { ProductCreationDto, SearchProductRequest } from '@mp/common/dtos';

import { CreateProductCommand } from './command/create-product.command';
import { SearchProductQuery } from './command/search-product-query';

@Controller('product')
export class ProductController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('search')
  @RequiredPermissions(PermissionCodes.Product.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search products for listing',
    description:
      'Search for products based on the provided filters and search text.',
  })
  searchAsync(@Body() searchProductRequestDto: SearchProductRequest) {
    return this.queryBus.execute(
      new SearchProductQuery(searchProductRequestDto),
    );
  }

  @Post()
  @HttpCode(201)
  @RequiredPermissions(PermissionCodes.Product.CREATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new product',
    description: 'Create a new product with the provided details.',
  })
  createProductAsync(@Body() productCreationDto: ProductCreationDto) {
    return this.commandBus.execute(
      new CreateProductCommand(productCreationDto),
    );
  }
}
