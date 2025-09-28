import { Module } from '@nestjs/common';

import { AuthenticationServiceModule } from './../../domain/service/authentication/authentication.service.module';
import { ClientServiceModule } from './../../domain/service/client/client.service.module';
import { OrderServiceModule } from './../../domain/service/order/order.service.module';
import { CreateOrderCommandHandler } from './command/create-order.command.handler';
import { OrderController } from './order.controller';
import { DownloadOrderQueryHandler } from './query/download-order.query.handler';
import { GetOrderByIdToClientQueryHandler } from './query/get-order-by-id-to-client.query.handler';
import { GetOrderByIdQueryHandler } from './query/get-order-by-id.query.handler';
import { SearchOrderFromClientQueryHandler } from './query/search-order-from-client.query.handler';
import { SearchOrderQueryHandler } from './query/search-order.query.handler';

const commandHandlers = [CreateOrderCommandHandler];
const queryHandlers = [
  SearchOrderFromClientQueryHandler,
  GetOrderByIdQueryHandler,
  GetOrderByIdToClientQueryHandler,
  SearchOrderQueryHandler,
  DownloadOrderQueryHandler,
];
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
