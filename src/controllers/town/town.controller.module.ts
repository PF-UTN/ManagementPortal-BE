import { Module } from '@nestjs/common';

import { GetTownByTextQueryHandler } from './query/get-towns-by-text.query.handler';
import { TownController } from './town.controller';
import { TownServiceModule } from '../../domain/service/town/town.service.module';

@Module({
  imports: [TownServiceModule],
  controllers: [TownController],
  providers: [GetTownByTextQueryHandler],
})
export class TownModule {}
