export class RegistrationRequestDto {
  id: number;
  status: string;
  requestDate: Date;
  user: UserDto;
}

class UserDto {
  fullNameOrBusinessName: string;
  email: string;
  documentType: string;
  documentNumber: string;
  phone: string;
  taxCategory: string;
  address: AddressDto;
}

class AddressDto {
  streetAddress: string;
  town: string;
  zipCode: string;
}
