import { UserBasicDto } from '../user';

export class RegistrationRequestDetailsDto {
  id: number;
  status: string;
  requestDate: Date;
  note?: string;
  user: UserBasicDto;
}
