export class CartInRedis {
  CartItems: CartInRedisItem[];
}

export class CartInRedisItem {
  productId: number;
  quantity: number;
}
