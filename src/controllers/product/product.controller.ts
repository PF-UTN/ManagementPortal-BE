import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import { SearchProductRequest } from '@mp/common/dtos';

import { SearchProductQuery } from './command/search-product-query';
import { GetProductByIdQuery } from './query/get-product-by-id.query';

@Controller('product')
export class ProductController {
  constructor(
    private readonly queryBus: QueryBus,
  ) { }

  @Post('search')
  @RequiredPermissions(PermissionCodes.Product.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search products for listing',
    description:
      'Search for products based on the provided filters and search text.',
  })
  searchAsync(
    @Body() searchProductRequestDto: SearchProductRequest,
  ) {
    return this.queryBus.execute(
      new SearchProductQuery(searchProductRequestDto),
    );
  }

  @Get(':id')
  @HttpCode(200)
  @ApiBearerAuth()
  @RequiredPermissions(PermissionCodes.Product.READ)
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Retrieve a product with the provided ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the product to retrieve',
  })
  getProductByIdAsync(
    @Param('id', ParseIntPipe) id: number)
  {
    return this.queryBus.execute(new GetProductByIdQuery(id));
  }
}