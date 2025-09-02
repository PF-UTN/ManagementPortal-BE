import { UpdateCartProductQuantityDto } from '../dtos';

export const mockUpdateCartProductQuantityDto: UpdateCartProductQuantityDto = {
  productId: 1,
  quantity: 0,
};

export const cartDtoMock = {
  cartId: '1',
  items: [
    {
      product: {
        id: 10,
        name: 'Producto Test',
        description: 'Descripción',
        price: 100,
        weight: 1,
        enabled: true,
        stock: {
          quantityAvailable: 10,
          quantityReserved: 0,
          quantityOrdered: 0,
        },
        category: {
          name: 'Categoría',
        },
        supplier: {
          businessName: 'Proveedor',
          email: 'proveedor@test.com',
          phone: '123456789',
        },
      },
      quantity: 2,
    },
  ],
};
