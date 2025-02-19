import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserCreationDto } from '../../../authentication/dto/user-creation.dto';
import { User } from '../../entity/user.entity';

@Injectable()
export class AuthenticationService {
  constructor(private userService: UserService) {}

  async signUp(signUpDto: UserCreationDto): Promise<User> {
    return await this.userService.createUser(signUpDto);
  }
}
