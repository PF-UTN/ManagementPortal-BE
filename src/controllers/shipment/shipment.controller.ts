import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
  DownloadShipmentRequest,
  FinishShipmentDto,
  SearchShipmentRequest,
  ShipmentCreationDto,
} from '@mp/common/dtos';
import { DateHelper, ExcelExportHelper } from '@mp/common/helpers';

import { CreateShipmentCommand } from './command/create-shipment.command';
import { FinishShipmentCommand } from './command/finish-shipment.command';
import { SendShipmentCommand } from './command/send-shipment.command';
import { DownloadShipmentQuery } from './query/download-shipment.query';
import { GetShipmentByIdQuery } from './query/get-shipment-by-id.query';
import { SearchShipmentQuery } from './query/search-shipment.query';

@Controller('shipment')
export class ShipmentController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('/')
  @RequiredPermissions(PermissionCodes.Shipment.CREATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a shipment',
    description: 'Create a new shipment.',
  })
  @ApiBody({ type: ShipmentCreationDto })
  async createShipmentAsync(@Body() shipmentCreationDto: ShipmentCreationDto) {
    return this.commandBus.execute(
      new CreateShipmentCommand(shipmentCreationDto),
    );
  }

  @HttpCode(204)
  @Patch('/:id/send')
  @RequiredPermissions(PermissionCodes.Shipment.UPDATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Send a shipment',
    description: 'Send an existant shipment.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the shipment to send',
  })
  async sendShipmentAsync(@Param('id', ParseIntPipe) id: number) {
    return this.commandBus.execute(new SendShipmentCommand(id));
  }

  @HttpCode(204)
  @Patch('/:id/finish')
  @RequiredPermissions(PermissionCodes.Shipment.UPDATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Finish a shipment',
    description: 'Finish an existant shipment.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the shipment to send',
  })
  @ApiBody({
    type: FinishShipmentDto,
  })
  async finishShipmentAsync(
    @Param('id', ParseIntPipe) id: number,
    @Body() finishShipmentDto: FinishShipmentDto,
  ) {
    return this.commandBus.execute(
      new FinishShipmentCommand(id, finishShipmentDto),
    );
  }

  @Get(':id')
  @HttpCode(200)
  @ApiBearerAuth()
  @RequiredPermissions(PermissionCodes.Shipment.READ)
  @ApiOperation({
    summary: 'Get shipment by ID',
    description: 'Retrieve an shipment with the provided ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the shipment to retrieve',
  })
  getShipmentByIdAsync(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetShipmentByIdQuery(id));
  }

  @Post('search')
  @RequiredPermissions(PermissionCodes.Shipment.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search shipments',
    description:
      'Search for shipments based on the provided filters and search text.',
  })
  async searchShipmentsAsync(
    @Body() searchShipmentRequestDto: SearchShipmentRequest,
  ) {
    return this.queryBus.execute(
      new SearchShipmentQuery(searchShipmentRequestDto),
    );
  }

  @Post('download')
  @RequiredPermissions(PermissionCodes.Shipment.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Download shipments',
    description:
      'Download shipments based on the provided filters and search text.',
  })
  async downloadShipmentsAsync(
    @Body() downloadShipmentDto: DownloadShipmentRequest,
  ): Promise<StreamableFile> {
    const shipments = await this.queryBus.execute(
      new DownloadShipmentQuery(downloadShipmentDto),
    );
    const buffer = ExcelExportHelper.exportToExcelBuffer(shipments);

    const filename = `${DateHelper.formatYYYYMMDD(new Date())} - Listado Envios`;

    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      length: buffer.length,
      disposition: `attachment; filename="${filename}"`,
    });
  }
}
