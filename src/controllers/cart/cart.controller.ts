import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import { ProductDetailsDto } from '@mp/common/dtos';

import { SaveProductRedisCommand } from './command/save-product-redis.command';

@Controller('cart')
export class CartController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('product/save/:productId')
  @RequiredPermissions(PermissionCodes.Cart.CREATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Save product to Redis',
    description: 'Save a product that has added to the cart in Redis.',
  })
  async saveProductToRedis(
    @Param('productId', ParseIntPipe) productId: number
  ): Promise<ProductDetailsDto> {
    return await this.commandBus.execute(new SaveProductRedisCommand(productId));
  }
}
