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
  StreamableFile,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
  DownloadProductRequest,
} from '@mp/common/dtos';
import { DateHelper, ExcelExportHelper } from '@mp/common/helpers';

import { AdjustProductStockCommand } from './command/adjust-product-stock.command';
import { CreateProductCommand } from './command/create-product.command';
import { DeleteProductCommand } from './command/delete-product.command';
import { SearchProductQuery } from './command/search-product-query';
import { UpdateEnabledProductCommand } from './command/update-enabled-product.command';
import { UpdateProductCommand } from './command/update-product.command';
import { DownloadProductQuery } from './query/download-product.query';
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

  @Post('download')
  @RequiredPermissions(PermissionCodes.Product.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Download listed products',
    description:
      'Download an XLSX for products based on the provided filters and search text.',
  })
  async downloadAsync(
    @Body() downloadProductRequest: DownloadProductRequest,
  ): Promise<StreamableFile> {
    const products = await this.queryBus.execute(
      new DownloadProductQuery(downloadProductRequest),
    );

    const buffer = ExcelExportHelper.exportToExcelBuffer(products);

    const filename = `${DateHelper.formatYYYYMMDD(new Date())} - Listado Productos`;

    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      length: buffer.length,
      disposition: `attachment; filename="${filename}"`,
    });
  }

  @Post()
  @HttpCode(201)
  @RequiredPermissions(PermissionCodes.Product.CREATE)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Create a new product',
    description:
      'Create a new product with the provided details and optional image.',
  })
  createProductAsync(
    @Body() productCreationDto: ProductCreationDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.commandBus.execute(
      new CreateProductCommand({ ...productCreationDto, image }),
    );
  }

  @Put(':id')
  @HttpCode(200)
  @RequiredPermissions(PermissionCodes.Product.UPDATE)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Update an existing product',
    description: 'Update the product with the provided ID and optional image.',
  })
  updateProductAsync(
    @Param('id', ParseIntPipe) id: number,
    @Body() productUpdateDto: ProductUpdateDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.commandBus.execute(
      new UpdateProductCommand(id, { ...productUpdateDto, image }),
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
