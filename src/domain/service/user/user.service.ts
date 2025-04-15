import { RoleIds } from '@mp/common/constants';
import { UserCreationDto } from '@mp/common/dtos';
import { EncryptionService } from '@mp/common/services';
import { UserRepository } from '@mp/repository';
import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

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

  async incrementFailedLoginAttemptsAsync(id: number) {
    const user = await this.userRepository.incrementFailedLoginAttemptsAsync(id);
    return user.failedLoginAttempts;
  }

  async updateAccountLockedUntilAsync(id: number, lockedUntil: Date) {
    return this.userRepository.updateAccountLockedUntilAsync(id, lockedUntil);
  }

  async resetFailedLoginAttemptsAndLockedUntilAsync(id: number) {
    return this.userRepository.resetFailedLoginAttemptsAndLockedUntilAsync(id);
  }
}
