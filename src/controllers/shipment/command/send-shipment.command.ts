import { Command } from '@nestjs/cqrs';

export class SendShipmentCommand extends Command<void> {
  constructor(public readonly id: number) {
    super();
  }
}
