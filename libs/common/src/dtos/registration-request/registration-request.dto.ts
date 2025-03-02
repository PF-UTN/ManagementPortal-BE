export class RegistrationRequestDto {
  id: number;
  status: string;
  requestDate: Date;
  user: UserDto;
}

export class UserDto {
  fullNameOrBusinessName: string;
  email: string;
  documentType: string;
  documentNumber: string;
  phone: string;
}
