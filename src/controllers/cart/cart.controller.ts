import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import {
  ProductDetailsDto,
  UpdateCartProductQuantityDto,
} from '@mp/common/dtos';

import { SaveProductRedisCommand } from './command/save-product-redis.command';
import { UpdateCartProductQuantityCommand } from './command/update-product-quantity-in-cart.command';

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
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<ProductDetailsDto> {
    return await this.commandBus.execute(
      new SaveProductRedisCommand(productId),
    );
  }

  @Post('update/:id')
  @RequiredPermissions(PermissionCodes.Cart.CREATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update product quantity in Cart',
    description: 'Update product quantity in cart in Redis.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the cart to update',
  })
  async updateCartProductQuantityAsync(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    updateCartProductQuantityDto: UpdateCartProductQuantityDto,
  ) {
    return await this.commandBus.execute(
      new UpdateCartProductQuantityCommand(id, updateCartProductQuantityDto),
    );
  }
}
