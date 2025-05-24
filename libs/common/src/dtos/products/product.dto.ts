import { Decimal } from "@prisma/client/runtime/library";

export class ProductDto {
  id: number;
  name: string;
  description: string;
  price: Decimal;         
  enabled: boolean;
  weight: Decimal;        
  categoryName: string;
  supplierBusinessName: string;
  stock?: number;
}

