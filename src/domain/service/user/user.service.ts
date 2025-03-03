import { Injectable } from '@nestjs/common';
import { User } from '../../entity/user.entity';
import { UserCreationDto } from '../../../controllers/authentication/dto/user-creation.dto';
import { UserRepository } from '@mp/repository';


@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUserAsync(userCreationDto: UserCreationDto): Promise<User> {
    const user = new User(
      userCreationDto.firstName,
      userCreationDto.lastName,
      userCreationDto.email,
      userCreationDto.password,
      userCreationDto.phone,
    );

    const newUser = await this.userRepository.createUserAsync(user);
    return newUser;
  }

  async findByEmailAsync(email: string): Promise<User | null> {
    return this.userRepository.findByEmailAsync(email);
  }
}
