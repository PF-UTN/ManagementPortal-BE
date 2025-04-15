export class UserServiceMock {
  createUserAsync = jest.fn();
  findByEmailAsync = jest.fn();
  hashPasswordAsync = jest.fn();
  findByIdAsync = jest.fn();
  incrementFailedLoginAttemptsAsync = jest.fn();
  updateAccountLockedUntilAsync = jest.fn();
  resetFailedLoginAttemptsAndLockedUntilAsync = jest.fn();
}