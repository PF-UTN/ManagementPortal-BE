export const suppliersMock = [
  {
    id: 1,
    businessName: 'Acme Inc.',
    documentType: 'CUIT',
    documentNumber: '30-12345678-9',
    email: 'info@acme.com',
    phone: '+54 11 1234-5678',
    addressId: 1,
  },
  {
    id: 2,
    businessName: 'Zeta Corp.',
    documentType: 'CUIT',
    documentNumber: '30-98765432-1',
    email: 'contact@zetacorp.com',
    phone: '+54 11 8765-4321',
    addressId: 1,
  },
];

export const supplierMock = {
  id: 1,
  businessName: 'Test Supplier',
  documentType: 'CUIT',
  documentNumber: '12345678901',
  email: 'test-supplier@mp.com',
  phone: '1234567890',
  addressId: 1,
};

export const supplierCreationDataMock = {
  businessName: 'Test Supplier',
  documentType: 'CUIT',
  documentNumber: '12345678901',
  email: 'test-supplier@mp.com',
  phone: '1234567890',
  addressId: 1,
};

export const supplierCreationDtoMock = {
  businessName: 'Test Supplier',
  documentType: 'CUIT',
  documentNumber: '12345678901',
  email: 'test-supplier@mp.com',
  phone: '1234567890',
  address: {
    townId: 1,
    street: 'Main St',
    streetNumber: 12345,
  },
};
