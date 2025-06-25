import { Module } from '@nestjs/common';

import { GetTownByTextQueryHandler } from './query/get-towns-by-text.query.handler';
import { SearchTownQueryHandler } from './query/search-town-query.handler';
import { TownController } from './town.controller';
import { TownServiceModule } from '../../domain/service/town/town.service.module';

const commandHandlers = [GetTownByTextQueryHandler, SearchTownQueryHandler];

@Module({
  imports: [TownServiceModule],
  controllers: [TownController],
  providers: [...commandHandlers],
})
export class TownModule {}
