import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import { PurchaseOrderCreationDto, SearchPurchaseOrderRequest } from '@mp/common/dtos';

import { CreatePurchaseOrderCommand } from './command/create-purchase-order.command';
import { GetPurchaseOrderByIdQuery } from './query/get-purchase-order-by-id.query';
import { SearchPurchaseOrderQuery } from './query/search-purchase-order.query';
@Controller('purchase-order')
export class PurchaseOrderController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('/')
  @RequiredPermissions(PermissionCodes.PurchaseOrder.CREATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a purchase order',
    description: 'Create a new purchase order.',
  })
  @ApiBody({ type: PurchaseOrderCreationDto })
  async createPurchaseOrderAsync(
    @Body() purchaseOrderCreationDto: PurchaseOrderCreationDto,
  ) {
    return this.commandBus.execute(
      new CreatePurchaseOrderCommand(purchaseOrderCreationDto),
    );
  }

  @Get(':id')
  @HttpCode(200)
  @ApiBearerAuth()
  @RequiredPermissions(PermissionCodes.PurchaseOrder.READ)
  @ApiOperation({
    summary: 'Get purchase order by ID',
    description: 'Retrieve a purchase order with the provided ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the purchase order to retrieve',
  })
  getPurchaseOrderByIdAsync(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetPurchaseOrderByIdQuery(id));
  }

  @Post('search')
  @RequiredPermissions(PermissionCodes.PurchaseOrder.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search purchase orders',
    description: 'Search for purchase orders based on the provided filters and search text.',
  })
  async searchPurchaseOrdersAsync(
    @Body() searchPurchaseOrderDto: SearchPurchaseOrderRequest,
  ) {
    return this.queryBus.execute(
      new SearchPurchaseOrderQuery(searchPurchaseOrderDto),
    );
  }
}
