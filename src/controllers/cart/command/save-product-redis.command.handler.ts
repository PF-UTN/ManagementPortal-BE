import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ProductDetailsDto } from '@mp/common/dtos';

import { ProductService } from './../../../domain/service/product/product.service';
import { SaveProductRedisCommand } from './save-product-redis.command';
import { CartService } from '../../../domain/service/cart/cart.service';

@CommandHandler(SaveProductRedisCommand)
export class SaveProductRedisCommandHandler
  implements ICommandHandler<SaveProductRedisCommand>
{
  constructor(
    private readonly cartService: CartService,
    private readonly productService: ProductService,
  ) {}

  async execute(command: SaveProductRedisCommand): Promise<ProductDetailsDto> {
    const foundProduct =
      await this.productService.findProductByIdAsync(
        command.productId,
      );

    if (!foundProduct) {
      throw new NotFoundException('Product not found');
    }
    const product: ProductDetailsDto = {
      id: foundProduct.id,
      name: foundProduct.name,
      description: foundProduct.description,
      price: foundProduct.price.toNumber(),
      weight: foundProduct.weight.toNumber(),
      stock: {
        quantityAvailable: foundProduct.stock?.quantityAvailable ?? 0,
        quantityReserved: foundProduct.stock?.quantityReserved ?? 0,
        quantityOrdered: foundProduct.stock?.quantityOrdered ?? 0,
      },
      category: {
        name: foundProduct.category.name,
      },
      supplier: {
        businessName: foundProduct.supplier.businessName,
        email: foundProduct.supplier.email,
        phone: foundProduct.supplier.phone,
      },
      enabled: foundProduct.enabled,
    };

    await this.cartService.saveProductToRedisAsync(product);
    return product;
  }
}
