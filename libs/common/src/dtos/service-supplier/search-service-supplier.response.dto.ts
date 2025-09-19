import { PartiallyInitializable } from '../partially-initializable';
import { ServiceSupplierSearchResponseDto } from './service-supplier-search-response.dto';

export class SearchServiceSupplierResponse extends PartiallyInitializable<SearchServiceSupplierResponse> {
  total: number;
  results: ServiceSupplierSearchResponseDto[];
}
