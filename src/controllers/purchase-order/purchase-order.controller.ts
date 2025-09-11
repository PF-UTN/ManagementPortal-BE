import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  StreamableFile,
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
import {
  UpdatePurchaseOrderStatusRequestDto,
  PurchaseOrderCreationDto,
  PurchaseOrderUpdateDto,
  SearchPurchaseOrderRequest,
  DownloadPurchaseOrderRequest,
} from '@mp/common/dtos';

import { CreatePurchaseOrderCommand } from './command/create-purchase-order.command';
import { DeletePurchaseOrderCommand } from './command/delete-purchase-order.command';
import { UpdatePurchaseOrderStatusCommand } from './command/update-purchase-order-status.command';
import { UpdatePurchaseOrderCommand } from './command/update-purchase-order.command';
import { DownloadPurchaseOrderQuery } from './query/download-purchase-order.query';
import { GetPurchaseOrderByIdQuery } from './query/get-purchase-order-by-id.query';
import { SearchPurchaseOrderQuery } from './query/search-purchase-order.query';
import {
  DateHelper,
  ExcelExportHelper,
} from '../../../libs/common/src/helpers';

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
    description:
      'Search for purchase orders based on the provided filters and search text.',
  })
  async searchPurchaseOrdersAsync(
    @Body() searchPurchaseOrderDto: SearchPurchaseOrderRequest,
  ) {
    return this.queryBus.execute(
      new SearchPurchaseOrderQuery(searchPurchaseOrderDto),
    );
  }

  @Post('download')
  @RequiredPermissions(PermissionCodes.PurchaseOrder.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Download purchase orders',
    description:
      'Download purchase orders based on the provided filters and search text.',
  })
  async downloadPurchaseOrdersAsync(
    @Body() downloadPurchaseOrderDto: DownloadPurchaseOrderRequest,
  ): Promise<StreamableFile> {
    const purchaseOrders = await this.queryBus.execute(
      new DownloadPurchaseOrderQuery(downloadPurchaseOrderDto),
    );
    const buffer = ExcelExportHelper.exportToExcelBuffer(purchaseOrders);

    const filename = `${DateHelper.formatYYYYMMDD(new Date())} - Listado Ordenes de Compra`;

    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      length: buffer.length,
      disposition: `attachment; filename="${filename}"`,
    });
  }

  @Delete(':id')
  @HttpCode(204)
  @RequiredPermissions(PermissionCodes.PurchaseOrder.DELETE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a purchase order',
    description: 'Delete the purchase order with the provided ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the purchase order to delete',
  })
  deletePurchaseOrderAsync(@Param('id', ParseIntPipe) id: number) {
    return this.commandBus.execute(new DeletePurchaseOrderCommand(id));
  }

  @Put(':id')
  @HttpCode(204)
  @RequiredPermissions(PermissionCodes.PurchaseOrder.UPDATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a purchase order',
    description: 'Update the purchase order with the provided ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the purchase order to update',
  })
  updatePurchaseOrderAsync(
    @Param('id', ParseIntPipe) id: number,
    @Body() purchaseOrderUpdateDto: PurchaseOrderUpdateDto,
  ) {
    return this.commandBus.execute(
      new UpdatePurchaseOrderCommand(id, purchaseOrderUpdateDto),
    );
  }

  @Patch(':id')
  @HttpCode(204)
  @RequiredPermissions(PermissionCodes.PurchaseOrder.UPDATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update status of a purchase order',
    description: 'Update the status of a purchase order with the provided ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the purchase order to update',
  })
  updatePurchaseOrderStatusAsync(
    @Param('id', ParseIntPipe) id: number,
    @Body() purchaseOrderStatusUpdateDto: UpdatePurchaseOrderStatusRequestDto,
  ) {
    return this.commandBus.execute(
      new UpdatePurchaseOrderStatusCommand(id, purchaseOrderStatusUpdateDto),
    );
  }
}
