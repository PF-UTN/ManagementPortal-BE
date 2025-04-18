export class JwtServiceMock {
  signAsync = jest.fn();
  verifyAsync = jest.fn();
}
