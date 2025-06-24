import { Decimal } from "@prisma/client/runtime/library";

import { GetProductByIdQuery } from "../../../../src/controllers/product/query/get-product-by-id.query";
import { ProductDetailsDto } from "../dtos";

export const productMockData = {
    id: 1,
    name: 'Product 1',
    description: 'Description for Product 1',
    price: new Decimal(19.99),
    weight: new Decimal(1.5),   
    enabled: true,
    stock: {
        quantityAvailable: 50,
        quantityReserved: 10,
        quantityOrdered: 5,
    },
    categoryId: 1,
    supplierId: 1,
    category: {
        name: 'Category 1',
    },
    supplier: {
        businessName: 'Supplier 1',
        email: 'supplier@mail.com',
        phone: '555-1234-5678',
    },
    deletedAt: null,
};

export const getProductByIdQueryMock = new GetProductByIdQuery(1);

export const productDetailsDtoMock: ProductDetailsDto = {
    id: productMockData.id,
    name: productMockData.name,
    description: productMockData.description,
    price: productMockData.price.toNumber(),
    weight: productMockData.weight.toNumber(),
    stock: {
        quantityAvailable: productMockData.stock.quantityAvailable,
        quantityReserved: productMockData.stock.quantityReserved,
        quantityOrdered: productMockData.stock.quantityOrdered,
    },
    category: {
        name: productMockData.category.name,
    },
    supplier: {
        businessName: productMockData.supplier.businessName,
        email: productMockData.supplier.email,
        phone: productMockData.supplier.phone,
    },
    enabled: productMockData.enabled,
};