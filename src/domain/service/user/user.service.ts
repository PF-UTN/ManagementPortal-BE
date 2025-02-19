import { Injectable } from '@nestjs/common';
import { User } from '../../entity/user.entity';
import { UserRepository } from '../../../libs/repository/user.repository';
import { UserCreationDto } from '../../../authentication/dto/user-creation.dto';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(signUpDto: UserCreationDto): Promise<User> {
    const user = new User(
      signUpDto.firstName,
      signUpDto.lastName,
      signUpDto.email,
      signUpDto.password,
      signUpDto.phone,
    );

    const newUser = await this.userRepository.createUser(user);
    return newUser;
  }
}
