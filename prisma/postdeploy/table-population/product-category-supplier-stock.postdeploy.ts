import { Product, ProductCategory, Supplier, Stock, Prisma } from '@prisma/client';

import { mergeTableData } from './generate-merge-data.script';

export const productPostDeployAsync = async () => {
  const categoryData: ProductCategory[] = [
    { id: 1, name: 'Electronics', description: 'Electronic devices' },
    { id: 2, name: 'Books', description: 'Various genres of books' },
    { id: 3, name: 'Clothing', description: 'Men and women apparel' },
  ];

  await mergeTableData('ProductCategory', categoryData);

  const supplierData: Supplier[] = [
    {
      id: 1,
      businessName: 'Supplier One',
      documentType: 'CUIT',
      documentNumber: '20123456789',
      email: 'supplier1@example.com',
      phone: '1234567890',
    },
    {
      id: 2,
      businessName: 'Supplier Two',
      documentType: 'CUIT',
      documentNumber: '20987654321',
      email: 'supplier2@example.com',
      phone: '0987654321',
    },
  ];

  await mergeTableData('Supplier', supplierData);

  const rawProductData: Product[] = [
  {
    id: 1,
    name: 'Smartphone',
    description: 'Latest model smartphone',
    price: new Prisma.Decimal(699.99),
    enabled: true,
    weight: new Prisma.Decimal(0.3),
    categoryId: 1,
    supplierId: 1,
  },
  {
    id: 2,
    name: 'T-Shirt',
    description: 'Cotton T-Shirt',
    price: new Prisma.Decimal(19.99),
    enabled: true,
    weight: new Prisma.Decimal(0.2),
    categoryId: 3,
    supplierId: 2,
  },
];

const productData: Record<string, string | number | Date>[] = rawProductData.map(p => ({
  id: p.id,
  name: p.name,
  description: p.description,
  price: p.price.toNumber(),            
  weight: p.weight.toNumber(),          
  enabled: p.enabled ? 1 : 0,          
  categoryId: p.categoryId,
  supplierId: p.supplierId,
}));

  await mergeTableData('Product', productData);

  const stockData: Stock[] = [
    {
      id: 1,
      productId: 1,
      quantityOrdered: 100,
      quantityAvailable: 80,
      quantityReserved: 20,
    },
    {
      id: 2,
      productId: 2,
      quantityOrdered: 200,
      quantityAvailable: 150,
      quantityReserved: 50,
    },
  ];

  await mergeTableData('Stock', stockData);
};
