export class CartInRedis {
  items: CartInRedisItem[];
}

export class CartInRedisItem {
  productId: number;
  quantity: number;
}
