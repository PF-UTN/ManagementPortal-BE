export class UserServiceMock {
  createUserAsync = jest.fn();
  findByEmailAsync = jest.fn();
  hashPasswordAsync = jest.fn();
  findByIdAsync = jest.fn();
}