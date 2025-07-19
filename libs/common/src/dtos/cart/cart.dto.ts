export class CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export class Cart {
  userId: string;
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}
