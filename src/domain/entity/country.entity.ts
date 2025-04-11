import { PartiallyInitializable } from '@mp/common/dtos';

export class Country extends PartiallyInitializable<Country> {
    id?: number;
    name: string;
}