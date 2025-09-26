import {
  Body,
  Controller,
  HttpCode,
  Headers,
  Post,
  StreamableFile,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { Public, RequiredPermissions } from '@mp/common/decorators';
import {
  DownloadOrderRequest,
  OrderCreationDto,
  SearchOrderFromClientRequest,
  SearchOrderRequest,
} from '@mp/common/dtos';
import { DateHelper, ExcelExportHelper } from '@mp/common/helpers';

import { CreateOrderCommand } from './command/create-order.command';
import { DownloadOrderQuery } from './query/download-order.query';
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

  @Post('download')
  @RequiredPermissions(PermissionCodes.Order.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Download purchase orders',
    description:
      'Download purchase orders based on the provided filters and search text.',
  })
  async downloadOrdersAsync(
    @Body() downloadOrderDto: DownloadOrderRequest,
  ): Promise<StreamableFile> {
    const purchaseOrders = await this.queryBus.execute(
      new DownloadOrderQuery(downloadOrderDto),
    );
    const buffer = ExcelExportHelper.exportToExcelBuffer(purchaseOrders);

    const filename = `${DateHelper.formatYYYYMMDD(new Date())} - Listado Pedidos`;

    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      length: buffer.length,
      disposition: `attachment; filename="${filename}"`,
    });
  }
}
