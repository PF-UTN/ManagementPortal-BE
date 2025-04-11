import { Query } from '@nestjs/cqrs';
import { Country } from '@prisma/client';

export class GetAllCountriesQuery extends Query<Country[]> {
  constructor() {
    super();
  }
}