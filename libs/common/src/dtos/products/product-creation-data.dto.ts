export class ProductCreationDataDto {
  name: string;
  description: string;
  price: number;
  enabled: boolean = true;
  weight: number;
  categoryId: number;
  supplierId: number;
}