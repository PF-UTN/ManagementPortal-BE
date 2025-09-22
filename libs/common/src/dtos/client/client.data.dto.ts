const MOCK_PASSWORD = 'test-password';

export const clientMock = {
  id: 1,
  companyName: 'Test Company',
  userId: 1,
  user: {
    id: 1,
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@mail.com',
    phone: '123456789',
    documentType: 'DNI',
    password: MOCK_PASSWORD,
    documentNumber: '12345678',
    birthdate: new Date('1990-01-01'),
    roleId: 2,
    accountLockedUntil: null,
    failedLoginAttempts: 0,
  },
  taxCategoryId: 1,
  taxCategory: {
    id: 1,
    name: 'Responsable Inscripto',
    description: 'IVA Responsable Inscripto',
  },
  addressId: 1,
  address: {
    id: 1,
    townId: 1,
    street: 'Calle Falsa',
    streetNumber: 123,
  },
  orders: [],
};
