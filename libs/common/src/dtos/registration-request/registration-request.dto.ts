import { RegistrationRequestStatus } from 'libs/common/src/constants/registration-request-status.constant';
import { AddressDto } from '../address.dto';

export class RegistrationRequestDto {
  id: string;
  fullNameOrBusinessName: string;
  email: string;
  status: RegistrationRequestStatus;
  requestDate: Date;
  documentTypeAndNumber: string;
  address: AddressDto;
  phone: string;
}
