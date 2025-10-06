import { Module } from '@nestjs/common';

import { AuthenticationServiceModule } from './../../domain/service/authentication/authentication.service.module';
import { ClientServiceModule } from './../../domain/service/client/client.service.module';
import { ClientController } from './client.controller';
import { GetClientAddressByUserIdQueryHandler } from './query/get-client-address-by-user-id.query.handler';

const queryHandlers = [GetClientAddressByUserIdQueryHandler];

@Module({
  imports: [AuthenticationServiceModule, ClientServiceModule],
  controllers: [ClientController],
  providers: [...queryHandlers],
})
export class ClientModule {}
