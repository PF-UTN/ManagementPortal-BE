import { UserWithAddressDto } from "../user";

export class RegistrationRequestDto {
  id: number;
  status: string;
  requestDate: Date;
  user: UserWithAddressDto;
}