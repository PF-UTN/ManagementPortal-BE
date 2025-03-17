import { PartiallyInitializable } from '@mp/common/dtos';

export class User extends PartiallyInitializable<User> {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  documentNumber: string;
  documentType: string;
}
