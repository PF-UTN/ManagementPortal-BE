import { User } from '../../../../src/domain/entity/user.entity';
import { UserCreationDto } from '../dtos';

export const userCreationDtoMock: UserCreationDto = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@test.com',
  password: 'password123',
  phone: '1234567890',
  documentNumber: '12345678',
  documentType: 'DNI',
};

export const userMock = new User({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'password123',
  phone: '1234567890',
  documentNumber: '123456789',
  documentType: 'DNI',
});

export const userSignInDtoMock = {
  email: 'john.doe@test.com',
  password: 'password123',
};
