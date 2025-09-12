import { ProductCreationDto, ProductDto, ProductUpdateDto } from '../dtos';

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

export const productCreationDtoWithImageMock: ProductCreationDto = {
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
  image: {
    fieldname: 'image',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('fake-image-data'),
  } as Express.Multer.File,
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

export const productUpdateDtoWithImageMock: ProductUpdateDto = {
  name: 'Test Product',
  description: 'Test Description',
  enabled: true,
  weight: 1.5,
  price: 100.25,
  categoryId: 1,
  supplierId: 1,
  image: {
    fieldname: 'image',
    originalname: 'updated-image.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: 2048,
    buffer: Buffer.from('fake-updated-image-data'),
  } as Express.Multer.File,
};

export const productDtoMock: ProductDto = {
  id: 123,
  name: 'Test Product',
  description: 'Test Description',
  enabled: true,
  weight: 1.5,
  price: 100.25,
  categoryName: 'TestName',
  supplierBusinessName: 'TestName',
  stock: 10,
  imageUrl:
    'https://blob.vercel-storage.com/products/123-1640995200000-test.jpg',
};

export const productDtoWithoutImageMock: ProductDto = {
  id: 123,
  name: 'Test Product',
  description: 'Test Description',
  enabled: true,
  weight: 1.5,
  price: 100.25,
  categoryName: 'TestName',
  supplierBusinessName: 'TestName',
  stock: 10,
  imageUrl: undefined,
};
