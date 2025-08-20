import { PartiallyInitializable } from '../partially-initializable';
import { MaintenanceSummaryDto } from './maintenance-summary.dto';

export class SearchMaintenanceResponse extends PartiallyInitializable<SearchMaintenanceResponse> {
  total: number;
  results: MaintenanceSummaryDto[];
}
