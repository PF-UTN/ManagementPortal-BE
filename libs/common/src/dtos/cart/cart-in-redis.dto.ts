export class CartInRedis {
  CartItems: CartInRedisItems[];
}

export class CartInRedisItems {
  productId: number;
  quantity: number;
}
