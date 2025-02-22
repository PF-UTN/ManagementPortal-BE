import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../../entity/user.entity';
import { UserCreationDto } from '../../../controllers/authentication/dto/user-creation.dto';

@Injectable()
export class AuthenticationService {
  constructor(private userService: UserService) {}

  async signUp(signUpDto: UserCreationDto): Promise<User> {
    return await this.userService.createUser(signUpDto);
  }
}
