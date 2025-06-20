import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Put,
  Patch,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import {
  ProductCreationDto,
  ProductPauseOrResumeDto,
  ProductUpdateDto,
  SearchProductRequest,
} from '@mp/common/dtos';

import { CreateProductCommand } from './command/create-product.command';
import { SearchProductQuery } from './command/search-product-query';
import { UpdateEnabledProductCommand } from './command/update-enabled-product.command';
import { UpdateProductCommand } from './command/update-product.command';
import { GetProductByIdQuery } from './query/get-product-by-id.query';

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

  @Put(':id')
  @HttpCode(200)
  @RequiredPermissions(PermissionCodes.Product.UPDATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update an existing product',
    description: 'Update the product with the provided ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the product to update',
  })
  updateProductAsync(
    @Param('id', ParseIntPipe) id: number,
    @Body() productUpdateDto: ProductUpdateDto,
  ) {
    return this.commandBus.execute(
      new UpdateProductCommand(id, productUpdateDto),
    );
  }

  @Patch(':id/pause')
  @HttpCode(200)
  @RequiredPermissions(PermissionCodes.Product.UPDATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Pause or resume a product',
    description: 'Pause or resume the product with the provided ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the product to pause or resume',
  })
  @ApiBody({ type: ProductPauseOrResumeDto })
  updateEnabledProductAsync(
    @Param('id', ParseIntPipe) id: number,
    @Body() { enabled }: ProductPauseOrResumeDto,
  ) {
    return this.commandBus.execute(
      new UpdateEnabledProductCommand(id, enabled),
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
  getProductByIdAsync(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetProductByIdQuery(id));
  }
}
