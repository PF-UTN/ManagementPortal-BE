import { Module } from '@nestjs/common';

import { OrderServiceModule } from './../../domain/service/order/order.service.module';
import { CreateOrderCommandHandler } from './command/create-order.command.handler';
import { OrderController } from './order.controller';

const commandHandlers = [CreateOrderCommandHandler];

@Module({
  imports: [OrderServiceModule],
  controllers: [OrderController],
  providers: [...commandHandlers],
})
export class OrderModule {}
