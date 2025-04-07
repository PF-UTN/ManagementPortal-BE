export class RegistrationRequestRepositoryMock {
  searchWithFiltersAsync = jest.fn();
  createRegistrationRequestAsync = jest.fn();
  findRegistrationRequestWithStatusByIdAsync = jest.fn();
  updateRegistrationRequestStatusAsync = jest.fn();
}
