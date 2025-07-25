export class CartItem {
  productId: string;
  quantity: number;
}

export class Cart {
  userId: string;
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}
