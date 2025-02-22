import { Injectable } from '@nestjs/common';
import { User } from '../../entity/user.entity';
import { UserCreationDto } from '../../../controllers/authentication/dto/user-creation.dto';
import { UserRepository } from '@mp/repository';


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
