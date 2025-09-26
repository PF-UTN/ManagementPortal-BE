import {
  Body,
  Controller,
  HttpCode,
  Headers,
  Get,
  Post,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { Public, RequiredPermissions } from '@mp/common/decorators';
import {
  OrderCreationDto,
  SearchOrderFromClientRequest,
} from '@mp/common/dtos';

import { CreateOrderCommand } from './command/create-order.command';
import { CheckoutOrderQuery } from './query/checkout-order.query';
import { GetOrderByIdForClientQuery } from './query/get-order-by-id-to-client.query';
import { GetOrderByIdQuery } from './query/get-order-by-id.query';
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

  @Get(':id')
  @HttpCode(200)
  @ApiBearerAuth()
  @RequiredPermissions(PermissionCodes.Order.READ)
  @Public()
  @ApiOperation({
    summary: 'Get order by ID',
    description: 'Retrieve an order with the provided ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the order to retrieve',
  })
  getOrderByIdAsync(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetOrderByIdQuery(id));
  }

  @Get('/client/:id')
  @HttpCode(200)
  @ApiBearerAuth()
  @RequiredPermissions(PermissionCodes.Order.READ)
  @Public()
  @ApiOperation({
    summary: 'Get order by ID to Client',
    description:
      'Retrieve an order with the provided ID with client-specific details.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the order to retrieve',
  })
  getOrderByIdToClientAsync(
    @Param('id', ParseIntPipe) id: number,
    @Headers('Authorization') authorizationHeader: string,
  ) {
    return this.queryBus.execute(
      new GetOrderByIdForClientQuery(id, authorizationHeader),
    );
  }

  @Get('checkout/:orderId')
  @ApiBearerAuth()
  @Public()
  @ApiOperation({
    summary: 'Get order ready for checkout',
    description: 'Process an order for checkout.',
  })
  async checkoutAsync(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Headers('Authorization') authorizationHeader: string,
  ) {
    return this.queryBus.execute(
      new CheckoutOrderQuery(orderId, authorizationHeader),
    );
  }
}
