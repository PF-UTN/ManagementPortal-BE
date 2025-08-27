import { PartiallyInitializable } from '../partially-initializable';
import { MaintenancePlanItemDetailDto } from './maintenance-plan-item-detail.dto';

export class SearchMaintenancePlanItemResponse extends PartiallyInitializable<SearchMaintenancePlanItemResponse> {
  total: number;
  results: MaintenancePlanItemDetailDto[];
}
