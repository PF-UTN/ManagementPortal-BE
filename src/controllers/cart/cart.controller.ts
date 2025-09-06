import { Body, Controller, Get, Post, Headers, Delete } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

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

  @Post('product/quantity')
  @RequiredPermissions(PermissionCodes.Cart.UPDATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update product quantity in Cart',
    description: 'Update product quantity in cart in Redis.',
  })
  async updateCartProductQuantityAsync(
    @Headers('Authorization') authorizationHeader: string,
    @Body() updateCartProductQuantityDto: UpdateCartProductQuantityDto,
  ) {
    return await this.commandBus.execute(
      new UpdateCartProductQuantityCommand(
        authorizationHeader,
        updateCartProductQuantityDto,
      ),
    );
  }

  @Delete('product')
  @RequiredPermissions(PermissionCodes.Cart.DELETE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete product from Cart',
    description: 'Delete product from cart in Redis.',
  })
  async deleteProductFromCartAsync(
    @Headers('Authorization') authorizationHeader: string,
    @Body() deleteProductFromCartDto: DeleteProductFromCartDto,
  ) {
    return await this.commandBus.execute(
      new DeleteProductCartCommand(
        authorizationHeader,
        deleteProductFromCartDto,
      ),
    );
  }

  @Delete()
  @RequiredPermissions(PermissionCodes.Cart.DELETE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Empty Cart',
    description: 'Empty the cart in Redis.',
  })
  async emptyCartAsync(@Headers('Authorization') authorizationHeader: string) {
    return await this.commandBus.execute(
      new EmptyCartCommand(authorizationHeader),
    );
  }

  @Get()
  @RequiredPermissions(PermissionCodes.Cart.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get User Cart',
    description: 'Retrieve the cart from the user.',
  })
  async getCartByIdAsync(
    @Headers('Authorization') authorizationHeader: string,
  ) {
    return await this.queryBus.execute(
      new GetCartByIdQuery(authorizationHeader),
    );
  }
}
