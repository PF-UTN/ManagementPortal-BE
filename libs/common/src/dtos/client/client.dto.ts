export class ClientDto {
  id: number;
  companyName: string;
  userId: number;
  taxCategoryId: number;
  addressId: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  taxCategory: {
    id: number;
    name: string;
    description: string;
  };
  address: {
    id: number;
    street: string;
    streetNumber: number;
    townId: number;
  };
}
