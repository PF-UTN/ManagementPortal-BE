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
  Delete,
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
  CreateManyStockChangeDto,
  ProductCreationDto,
  ProductToggleDto,
  ProductUpdateDto,
  SearchProductRequest,
} from '@mp/common/dtos';

import { AdjustProductStockCommand } from './command/adjust-product-stock.command';
import { CreateProductCommand } from './command/create-product.command';
import { DeleteProductCommand } from './command/delete-product.command';
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

  @Patch(':id/toggle')
  @HttpCode(200)
  @RequiredPermissions(PermissionCodes.Product.UPDATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update product enabled status',
    description: 'Pause or resume a product by updating its enabled status.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the product to pause or resume',
  })
  @ApiBody({ type: ProductToggleDto })
  updateEnabledProductAsync(
    @Param('id', ParseIntPipe) id: number,
    @Body() { enabled }: ProductToggleDto,
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

  @Delete(':id')
  @HttpCode(204)
  @RequiredPermissions(PermissionCodes.Product.DELETE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a product',
    description: 'Delete the product with the provided ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the product to delete',
  })
  deleteProductAsync(@Param('id', ParseIntPipe) id: number) {
    return this.commandBus.execute(new DeleteProductCommand(id));
  }

  @Post('stock-change')
  @HttpCode(201)
  @RequiredPermissions(
    PermissionCodes.Stock.UPDATE,
    PermissionCodes.StockChange.CREATE,
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create stock adjustment for a product',
    description:
      'Create a stock adjustment entry for the product with the provided ID.',
  })
  adjustProductStockAsync(
    @Body() createManyStockChangeDto: CreateManyStockChangeDto,
  ) {
    return this.commandBus.execute(
      new AdjustProductStockCommand(createManyStockChangeDto),
    );
  }
}
