import { Injectable } from '@nestjs/common';
import { UserRepository } from '@mp/repository';
import { UserCreationDto } from '@mp/common/dtos';
import { User } from '../../entity/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUserAsync(userCreationDto: UserCreationDto): Promise<User> {
    const hashedPassword = await this.hashPasswordAsync(
      userCreationDto.password,
    );

    const user = new User({
      ...userCreationDto,
      password: hashedPassword,
    });

    const newUser = await this.userRepository.createUserAsync(user);
    return newUser;
  }

  async findByEmailAsync(email: string): Promise<User | null> {
    return this.userRepository.findByEmailAsync(email);
  }

  async hashPasswordAsync(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}
