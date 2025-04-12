export class RegistrationRequestRepositoryMock {
  searchWithFiltersAsync = jest.fn();
  createRegistrationRequestAsync = jest.fn();
  findRegistrationRequestWithStatusByIdAsync = jest.fn();
  findRegistrationRequestWithDetailsByIdAsync = jest.fn();
  updateRegistrationRequestStatusAsync = jest.fn();
}
