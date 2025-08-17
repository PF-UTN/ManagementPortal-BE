import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import { ProductDetailsDto } from '@mp/common/dtos';

import { SaveProductRedisCommand } from './command/save-product-redis.command';
import { GetProductByIdRedisQuery } from './query/get-product-by-id-redis.query';

@Controller('cart')
export class CartController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('product/save/:productId')
  @RequiredPermissions(PermissionCodes.Cart.CREATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Save product to Redis',
    description: 'Save a product that has added to the cart in Redis.',
  })
  async saveProductToRedis(
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<ProductDetailsDto> {
    return await this.commandBus.execute(
      new SaveProductRedisCommand(productId),
    );
  }

  @Get('product/:productId')
  @HttpCode(200)
  @ApiBearerAuth()
  @RequiredPermissions(PermissionCodes.Cart.READ)
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Retrieve a product with the provided ID from Redis.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the product to retrieve',
  })
  getProductByIdAsync(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetProductByIdRedisQuery(id));
  }
}
