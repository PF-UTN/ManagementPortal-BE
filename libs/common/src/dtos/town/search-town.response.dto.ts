import { PartiallyInitializable } from '../partially-initializable';
import { TownDto } from './town.dto';

export class SearchTownResponse extends PartiallyInitializable<SearchTownResponse> {
  total: number;
  results: TownDto[];
}
