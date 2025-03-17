import { PartiallyInitializable } from '../partially-initializable';
import { RegistrationRequestDto } from './registration-request.dto';

export class SearchRegistrationRequestResponse extends PartiallyInitializable<SearchRegistrationRequestResponse> {
  total: number;
  results: RegistrationRequestDto[];
}
