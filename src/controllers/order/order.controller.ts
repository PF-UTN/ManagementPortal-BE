import {
  Body,
  Controller,
  HttpCode,
  Headers,
  Post,
  Get,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { Public, RequiredPermissions } from '@mp/common/decorators';
import {
  OrderCreationDto,
  SearchOrderFromClientRequest,
} from '@mp/common/dtos';

import { CreateOrderCommand } from './command/create-order.command';
import { CheckoutOrderQuery } from './query/checkout-order.query';
import { SearchOrderFromClientQuery } from './query/search-order.query';

@Controller('order')
export class OrderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(201)
  @RequiredPermissions(PermissionCodes.Order.CREATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new order',
    description: 'Create a new order with the provided details.',
  })
  createOrderAsync(@Body() orderCreationDto: OrderCreationDto) {
    return this.commandBus.execute(new CreateOrderCommand(orderCreationDto));
  }

  @Post('client/search')
  @ApiBearerAuth()
  @Public()
  @ApiOperation({
    summary: 'Search orders from client',
    description:
      'Search for orders based on the provided filters, search text and client.',
  })
  async searchOrdersFromClientAsync(
    @Headers('Authorization') authorizationHeader: string,
    @Body() searchOrderFromClientRequest: SearchOrderFromClientRequest,
  ) {
    return this.queryBus.execute(
      new SearchOrderFromClientQuery(
        searchOrderFromClientRequest,
        authorizationHeader,
      ),
    );
  }

  @Get('checkout/:orderId/:shipmentMethodId')
  @ApiBearerAuth()
  @Public()
  @ApiOperation({
    summary: 'Get order ready for checkout',
    description: 'Process an order for checkout.',
  })
  async checkoutAsync(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('shipmentMethodId', ParseIntPipe) shipmentMethodId: number,
  ) {
    return this.queryBus.execute(
      new CheckoutOrderQuery(orderId, shipmentMethodId),
    );
  }
}
