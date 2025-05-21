export class ProductDto {
  id: number;
  name: string;
  description: string;
  price: number;         
  enabled: boolean;
  weight: number;        
  categoryId: number;
  supplierId: number;
  // category?: ProductCategoryDto;
  // supplier?: SupplierDto;
  // stock?: StockDto;
  // priceHistory?: PriceHistoryDto[];
}

