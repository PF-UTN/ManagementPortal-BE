import { Body, Controller, HttpCode, Headers, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { Public, RequiredPermissions } from '@mp/common/decorators';
import {
  OrderCreationDto,
  SearchOrderFromClientRequest,
  SearchOrderRequest,
} from '@mp/common/dtos';

import { CreateOrderCommand } from './command/create-order.command';
import { SearchOrderFromClientQuery } from './query/search-order-from-client.query';
import { SearchOrderQuery } from './query/search-order.query';

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

  @Post('search')
  @RequiredPermissions(PermissionCodes.Order.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search orders',
    description:
      'Search for orders based on the provided filters and search text.',
  })
  async searchOrdersAsync(@Body() searchOrderRequestDto: SearchOrderRequest) {
    return this.queryBus.execute(new SearchOrderQuery(searchOrderRequestDto));
  }
}
