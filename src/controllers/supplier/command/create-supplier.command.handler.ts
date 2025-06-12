import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateSupplierCommand } from './create-supplier.command';
import { SupplierService } from '../../../domain/service/supplier/supplier.service';

@CommandHandler(CreateSupplierCommand)
export class CreateSupplierCommandHandler
  implements ICommandHandler<CreateSupplierCommand>
{
  constructor(private readonly supplierService: SupplierService) {}

  async execute(command: CreateSupplierCommand) {
    const supplier = await this.supplierService.createOrUpdateSupplierAsync(
      command.supplierCreationDto,
    );
    return supplier;
  }
}
