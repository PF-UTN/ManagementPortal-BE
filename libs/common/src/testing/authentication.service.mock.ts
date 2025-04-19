export class AuthenticationServiceMock {
  signInAsync = jest.fn();
  requestPasswordResetAsync = jest.fn();
  resetPasswordAsync = jest.fn();
}
