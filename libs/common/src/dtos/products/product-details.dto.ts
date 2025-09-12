export class ProductDetailsDto {
  id: number;
  name: string;
  description: string;
  price: number;
  weight: number;
  enabled: boolean;
  imageUrl?: string;
  stock: {
    quantityAvailable: number;
    quantityReserved: number;
    quantityOrdered: number;
  };
  category: {
    name: string;
  };
  supplier: {
    businessName: string;
    email: string;
    phone: string;
  };
}
