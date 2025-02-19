export class User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;

  constructor(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phone: string,
    id?: number,
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.id = id;
  }
}
