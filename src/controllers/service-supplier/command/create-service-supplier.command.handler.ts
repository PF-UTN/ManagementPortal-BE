import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateServiceSupplierCommand } from './create-service-supplier.command';
import { ServiceSupplierService } from '../../../domain/service/service-supplier/service-supplier.service';

@CommandHandler(CreateServiceSupplierCommand)
export class CreateServiceSupplierCommandHandler
  implements ICommandHandler<CreateServiceSupplierCommand>
{
  constructor(
    private readonly serviceSupplierService: ServiceSupplierService,
  ) {}

  async execute(command: CreateServiceSupplierCommand) {
    const serviceSupplier =
      await this.serviceSupplierService.createOrUpdateServiceSupplierAsync(
        command.serviceSupplierCreationDto,
      );
    return serviceSupplier;
  }
}
