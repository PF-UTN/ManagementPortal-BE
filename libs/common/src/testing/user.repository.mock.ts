export class UserRepositoryMock {
  createUserAsync = jest.fn();
  findByIdAsync = jest.fn();
  findByEmailAsync = jest.fn();
  incrementFailedLoginAttemptsAsync = jest.fn();
  updateAccountLockedUntilAsync = jest.fn();
  resetFailedLoginAttemptsAndLockedUntilAsync = jest.fn();
}