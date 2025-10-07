import { PartiallyInitializable } from '../partially-initializable';
import { SearchShipmentReturnDataDto } from './search-shipment-return-data.dto';

export class SearchShipmentResponse extends PartiallyInitializable<SearchShipmentResponse> {
  total: number;
  results: SearchShipmentReturnDataDto[];
}
