import { PartiallyInitializable } from '../partially-initializable';
import { RepairSummaryDto } from './repair-summary.dto';

export class SearchRepairResponse extends PartiallyInitializable<SearchRepairResponse> {
  total: number;
  results: RepairSummaryDto[];
}
