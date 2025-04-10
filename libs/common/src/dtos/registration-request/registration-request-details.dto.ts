import { UserDto } from './registration-request.dto';

export class RegistrationRequestDetailsDto {
  id: number;
  status: string;
  requestDate: Date;
  note?: string;
  user: UserDto;
}
