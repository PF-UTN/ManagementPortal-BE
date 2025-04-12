export class EncryptionServiceMock {
  hashAsync = jest.fn();
  compareAsync = jest.fn();
  genSaltAsync = jest.fn();
}
