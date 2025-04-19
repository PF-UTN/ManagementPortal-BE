export const createPrismaModelMock = () => ({
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
});

export class PrismaServiceMock {
  user = createPrismaModelMock();
  registrationRequest = createPrismaModelMock();
  registrationRequestStatus = createPrismaModelMock();
  town = createPrismaModelMock();
}

