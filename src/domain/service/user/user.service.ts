import { Injectable } from '@nestjs/common';
import { UserRepository } from '@mp/repository';
import { UserCreationDto } from '@mp/common/dtos';
import { EncryptionService } from '@mp/common/services';
import { Prisma, User } from '@prisma/client';
import { RoleIds } from '@mp/common/constants';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly encryptionService: EncryptionService,
  ) {}

  async createUserAsync(userCreationDto: UserCreationDto): Promise<User> {
    const hashedPassword = await this.hashPasswordAsync(
      userCreationDto.password,
    );

    const user = {
      ...userCreationDto,
      password: hashedPassword,
      role: { connect: { id: RoleIds.Employee } },
    } as Prisma.UserCreateInput;

    const newUser = await this.userRepository.createUserAsync(user);
    return newUser;
  }

  async findByEmailAsync(email: string) {
    return this.userRepository.findByEmailAsync(email);
  }

  private async hashPasswordAsync(password: string): Promise<string> {
    return await this.encryptionService.hashAsync(password);
  }

  async findByIdAsync(id: number): Promise<User | null> {
    return this.userRepository.findByIdAsync(id);
  }
}
