import { ProductCreationDto, ProductUpdateDto } from '../dtos';

export const productCreationDtoMock: ProductCreationDto = {
  name: 'Test Product',
  description: 'Test Description',
  enabled: true,
  weight: 1.5,
  price: 100.25,
  categoryId: 1,
  supplierId: 1,
  stock: {
    quantityAvailable: 50,
    quantityOrdered: 60,
    quantityReserved: 10,
  },
};

export const productUpdateDtoMock: ProductUpdateDto = {
  name: 'Test Product',
  description: 'Test Description',
  enabled: true,
  weight: 1.5,
  price: 100.25,
  categoryId: 1,
  supplierId: 1,
};
