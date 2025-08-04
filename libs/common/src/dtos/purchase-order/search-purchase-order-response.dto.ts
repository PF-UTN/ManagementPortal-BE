import { PartiallyInitializable } from '../partially-initializable';
import { PurchaseOrderDto } from './purchase-order.dto';

export class SearchPurchaseOrderResponse extends PartiallyInitializable<SearchPurchaseOrderResponse> {
  total: number;
  results: PurchaseOrderDto[];
}