import { Command } from '@nestjs/cqrs';

import { CreateManyStockChangeDto } from '@mp/common/dtos';

export class AdjustProductStockCommand extends Command<void> {
  constructor(
    public readonly createManyStockChangeDto: CreateManyStockChangeDto,
  ) {
    super();
  }
}
