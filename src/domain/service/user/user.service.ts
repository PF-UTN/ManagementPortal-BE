import { Injectable } from '@nestjs/common';
import { UserRepository } from '@mp/repository';
import { UserCreationDto } from '@mp/common/dtos';
import { User } from '../../entity/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(userCreationDto: UserCreationDto): Promise<User> {
    const user = new User({
      ...userCreationDto,
    });

    const newUser = await this.userRepository.createUser(user);
    return newUser;
  }
}
