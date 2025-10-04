export const newClientMock = {
  id: 1,
  companyName: 'Test Company',
  userId: 1,
  taxCategoryId: 1,
  addressId: 1,
};

export const clientMock = {
  id: 1,
  companyName: 'Test Company',
  userId: 1,
  taxCategoryId: 1,
  addressId: 1,
  user: {
    id: 1,
    firstName: 'Juan',
    lastName: 'Perez',
    email: 'juan@mail.com',
    password: 'hashed',
    phone: '123456789',
    documentType: 'DNI',
    documentNumber: '12345678',
    birthdate: new Date('1990-01-01'),
    roleId: 2,
    accountLockedUntil: null,
    failedLoginAttempts: 0,
  },
  taxCategory: {
    id: 1,
    name: 'Responsable Inscripto',
    description: null,
  },
  address: {
    id: 1,
    townId: 1,
    street: 'Calle Falsa',
    streetNumber: 123,
  },
};

export const clientAddressMock = {
  id: 1,
  companyName: 'Test Company',
  userId: 1,
  taxCategoryId: 1,
  addressId: 10,
  address: {
    id: 10,
    townId: 100,
    street: 'Calle Falsa',
    streetNumber: 123,
    town: {
      id: 100,
      name: 'Rosario',
      zipCode: '2000',
      provinceId: 200,
      province: {
        id: 200,
        name: 'Santa Fe',
        countryId: 300,
        country: {
          id: 300,
          name: 'Argentina',
        },
      },
    },
  },
};

export const clientAddressMockInService = {
  id: 1,
  address: {
    street: 'Calle Falsa',
    streetNumber: 123,
    town: {
      name: 'Rosario',
      zipCode: '2000',
      province: {
        name: 'Santa Fe',
        country: {
          name: 'Argentina',
        },
      },
    },
  },
};
