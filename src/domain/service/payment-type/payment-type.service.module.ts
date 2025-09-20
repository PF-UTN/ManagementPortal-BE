import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { PaymentTypeService } from './payment-type.service';

@Module({
  imports: [RepositoryModule],
  providers: [PaymentTypeService],
  exports: [PaymentTypeService],
})
export class PaymentTypeServiceModule {}
