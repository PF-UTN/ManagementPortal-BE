import { PartiallyInitializable } from '../partially-initializable';
import { ProductDto } from './product.dto';

export class SearchProductResponse extends PartiallyInitializable<SearchProductResponse> {
  total: number;
  results: ProductDto[];
}
