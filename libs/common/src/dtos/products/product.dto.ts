export class ProductDto {
  id: number;
  name: string;
  description: string;
  price: number;
  enabled: boolean;
  weight: number;
  imageUrl?: string;
  categoryName: string;
  supplierBusinessName: string;
  stock: number;
}
