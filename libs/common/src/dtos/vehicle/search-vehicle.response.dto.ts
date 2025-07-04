import { PartiallyInitializable } from '../partially-initializable';
import { VehicleDto } from './vehicle.dto';

export class SearchVehicleResponse extends PartiallyInitializable<SearchVehicleResponse> {
  total: number;
  results: VehicleDto[];
}
