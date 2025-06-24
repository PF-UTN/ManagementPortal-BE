import { Command } from '@nestjs/cqrs';

export class DeleteProductCommand extends Command<void> {
  constructor(public readonly productId: number) {
    super();
  }
}
