export class OrderItemDataDto {
  id: number;
  orderId: number;
  unitPrice: number;
  quantity: number;
  subtotalPrice: number;
  product: {
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
  };
}

export class OrderItemDataToClientDto {
  unitPrice: number;
  quantity: number;
  subtotalPrice: number;
  product: {
    name: string;
    description: string;
    price: number;
    weight: number;
    imageUrl?: string;
    category: {
      name: string;
    };
  };
}
