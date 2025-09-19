import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';
import { OrderCreationDto } from '@mp/common/dtos';

import { CreateOrderCommand } from './command/create-order.command';

@Controller('order')
export class OrderController {
  constructor(private readonly commandBus: CommandBus) {}

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
}
