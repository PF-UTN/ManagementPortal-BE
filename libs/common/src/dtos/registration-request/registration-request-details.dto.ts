export class RegistrationRequestDetailsDto {
  id: number;
  status: string;
  requestDate: Date;
  note?: string;
  user: UserDto;
}

export class UserDto {
  fullNameOrBusinessName: string;
  email: string;
  documentType: string;
  documentNumber: string;
  phone: string;
}
