import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
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
import { FinishShipmentDto, ShipmentCreationDto } from '@mp/common/dtos';

import { CreateShipmentCommand } from './command/create-shipment.command';
import { FinishShipmentCommand } from './command/finish-shipment.command';
import { SendShipmentCommand } from './command/send-shipment.command';
import { GetShipmentByIdQuery } from './query/get-shipment-by-id.query';

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
}
