import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../libs/repository/user.repository';
import { SignUpDto } from '../../authentication/dto/sign-up.dto';
import { User } from 'src/domain/entity/user.entity';

@Injectable()
export class AuthenticationService {
  constructor(private userRepository: UserRepository) {}

  async signUp(signUpDto: SignUpDto): Promise<User> {
    const newUser = await this.userRepository.createUser(signUpDto);
    console.log(newUser);

    const userEntity = new User(
      newUser.firstName,
      newUser.lastName,
      newUser.email,
      newUser.password,
      newUser.phone,
      newUser.id,
    );

    console.log(userEntity);
    return userEntity;
  }
}
