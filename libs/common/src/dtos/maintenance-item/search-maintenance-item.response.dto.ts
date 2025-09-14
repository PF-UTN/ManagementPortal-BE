import { PartiallyInitializable } from '../partially-initializable';
import { MaintenanceItemDto } from './maintenance-item.dto';

export class SearchMaintenanceItemResponse extends PartiallyInitializable<SearchMaintenanceItemResponse> {
  total: number;
  results: MaintenanceItemDto[];
}
