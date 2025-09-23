import { Module } from '@nestjs/common';

import { AuthenticationServiceModule } from './../../domain/service/authentication/authentication.service.module';
import { ClientServiceModule } from './../../domain/service/client/client.service.module';
import { OrderServiceModule } from './../../domain/service/order/order.service.module';
import { CreateOrderCommandHandler } from './command/create-order.command.handler';
import { OrderController } from './order.controller';
import { SearchOrderFromClientQueryHandler } from './query/search-order.query.handler';

const commandHandlers = [CreateOrderCommandHandler];
const queryHandlers = [SearchOrderFromClientQueryHandler];
@Module({
  imports: [
    OrderServiceModule,
    AuthenticationServiceModule,
    ClientServiceModule,
  ],
  controllers: [OrderController],
  providers: [...commandHandlers, ...queryHandlers],
})
export class OrderModule {}
