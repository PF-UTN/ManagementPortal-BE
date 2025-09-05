import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import {
  UpdateCartProductQuantityDto,
  DeleteProductFromCartDto,
} from '@mp/common/dtos';

import { DeleteProductCartCommand } from './command/delete-product-cart.command';
import { EmptyCartCommand } from './command/empty-cart.command';
import { UpdateCartProductQuantityCommand } from './command/update-product-quantity-in-cart.command';
import { GetCartByIdQuery } from './query/get-cart-by-id.query';

@Controller('cart')
export class CartController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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

  @Post('delete/:cartId')
  @RequiredPermissions(PermissionCodes.Cart.DELETE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete product from Cart',
    description: 'Delete product from cart in Redis.',
  })
  @ApiParam({
    name: 'cartId',
    description: 'ID of the cart to update',
  })
  async deleteProductFromCartAsync(
    @Param('cartId', ParseIntPipe) cartId: number,
    @Body() deleteProductFromCartDto: DeleteProductFromCartDto,
  ) {
    return await this.commandBus.execute(
      new DeleteProductCartCommand(cartId, deleteProductFromCartDto),
    );
  }

  @Post('empty/:cartId')
  @RequiredPermissions(PermissionCodes.Cart.DELETE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Empty Cart',
    description: 'Empty the cart in Redis.',
  })
  @ApiParam({
    name: 'cartId',
    description: 'ID of the cart to empty',
  })
  async emptyCartAsync(@Param('cartId', ParseIntPipe) cartId: number) {
    return await this.commandBus.execute(new EmptyCartCommand(cartId));
  }

  @Get('get/:cartId')
  @RequiredPermissions(PermissionCodes.Cart.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Cart by ID',
    description: 'Retrieve the cart by its ID.',
  })
  @ApiParam({
    name: 'cartId',
    description: 'ID of the cart to retrieve',
  })
  async getCartByIdAsync(@Param('cartId', ParseIntPipe) cartId: number) {
    return await this.queryBus.execute(new GetCartByIdQuery(cartId));
  }
}
