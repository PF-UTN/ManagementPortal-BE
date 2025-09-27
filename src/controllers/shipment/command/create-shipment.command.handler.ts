import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateShipmentCommand } from './create-shipment.command';
import { ShipmentService } from '../../../domain/service/shipment/shipment.service';

@CommandHandler(CreateShipmentCommand)
export class CreateShipmentCommandHandler
  implements ICommandHandler<CreateShipmentCommand>
{
  constructor(private readonly shipmentService: ShipmentService) {}

  async execute(command: CreateShipmentCommand) {
    if (
      !command.shipmentCreationDto.orderIds ||
      command.shipmentCreationDto.orderIds.length === 0
    ) {
      throw new BadRequestException('At least one order must be provided.');
    }

    const shipment = await this.shipmentService.createShipmentAsync(
      command.shipmentCreationDto,
    );
    return shipment;
  }
}
