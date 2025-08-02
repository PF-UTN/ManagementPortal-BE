import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import { PurchaseOrderCreationDto, SearchPurchaseOrderRequest } from '@mp/common/dtos';

import { CreatePurchaseOrderCommand } from './command/create-purchase-order.command';
import { SearchPurchaseOrderQuery } from './query/search-purchase-order.query';
@Controller('purchase-order')
export class PurchaseOrderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
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
