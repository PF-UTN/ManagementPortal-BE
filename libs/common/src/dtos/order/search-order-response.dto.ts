import { PartiallyInitializable } from '../partially-initializable';
import { SearchOrderReturnDataDto } from './search-order-return-data.dto';

export class SearchOrderResponse extends PartiallyInitializable<SearchOrderResponse> {
  total: number;
  results: SearchOrderReturnDataDto[];
}
