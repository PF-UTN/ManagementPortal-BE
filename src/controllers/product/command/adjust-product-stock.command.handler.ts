import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { AdjustProductStockCommand } from './adjust-product-stock.command';
import { StockService } from '../../../domain/service/stock/stock.service';

@CommandHandler(AdjustProductStockCommand)
export class AdjustProductStockCommandHandler
  implements ICommandHandler<AdjustProductStockCommand>
{
  constructor(private readonly stockService: StockService) {}

  async execute(command: AdjustProductStockCommand) {
    await this.stockService.adjustProductStockAsync(
      command.createManyStockChangeDto,
    );
  }
}
