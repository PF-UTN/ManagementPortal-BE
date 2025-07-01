import { AddressForRegistrationRequestDto } from "../address";

export class UserWithAddressDto {
  fullNameOrBusinessName: string;
  email: string;
  documentType: string;
  documentNumber: string;
  phone: string;
  taxCategory: string;
  address: AddressForRegistrationRequestDto;
}