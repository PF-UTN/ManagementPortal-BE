export class ProductCreationDataDto {
  name: string;
  description: string;
  price: number;
  enabled: boolean = true;
  imageUrl?: string;
  weight: number;
  categoryId: number;
  supplierId: number;
}
