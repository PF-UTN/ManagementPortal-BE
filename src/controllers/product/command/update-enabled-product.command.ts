import { Command } from '@nestjs/cqrs';

export class UpdateEnabledProductCommand extends Command<void> {
  constructor(public readonly productId: number, public readonly enabled: boolean) {
    super();
  }
}
