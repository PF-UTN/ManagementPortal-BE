import { Module } from '@nestjs/common';
import { ProvinceController } from './province.controller';
import { ProvinceServiceModule } from '../../domain/service/province/province.service.module';
import { GetProvincesByIdQueryHandler } from './query/get-provinces-by-country-id.query.handler';

@Module({
    imports: [ProvinceServiceModule],
    controllers: [ProvinceController],
    providers: [GetProvincesByIdQueryHandler],
})
export class ProvinceModule { }