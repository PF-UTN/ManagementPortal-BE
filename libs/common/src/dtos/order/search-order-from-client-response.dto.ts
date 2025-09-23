import { PartiallyInitializable } from '../partially-initializable';
import { OrderDto } from './order.dto';

export class SearchOrderFromClientResponse extends PartiallyInitializable<SearchOrderFromClientResponse> {
  total: number;
  results: OrderDto[];
}
