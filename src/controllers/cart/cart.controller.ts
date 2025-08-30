import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import { UpdateCartProductQuantityDto } from '@mp/common/dtos';

import { UpdateCartProductQuantityCommand } from './command/update-product-quantity-in-cart.command';

@Controller('cart')
export class CartController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('update/:cartId')
  @RequiredPermissions(PermissionCodes.Cart.UPDATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update product quantity in Cart',
    description: 'Update product quantity in cart in Redis.',
  })
  @ApiParam({
    name: 'cartId',
    description: 'ID of the cart to update',
  })
  async updateCartProductQuantityAsync(
    @Param('cartId', ParseIntPipe) cartId: number,
    @Body() updateCartProductQuantityDto: UpdateCartProductQuantityDto,
  ) {
    return await this.commandBus.execute(
      new UpdateCartProductQuantityCommand(
        cartId,
        updateCartProductQuantityDto,
      ),
    );
  }
}
