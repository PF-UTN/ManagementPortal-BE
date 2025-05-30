import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { RegistrationRequestStatusId, RoleIds } from '@mp/common/constants';
import { UserCreationDto, UserCreationResponse } from '@mp/common/dtos';
import { EncryptionService } from '@mp/common/services';
import {
  ClientRepository,
  PrismaUnitOfWork,
  RegistrationRequestRepository,
  UserRepository,
} from '@mp/repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly encryptionService: EncryptionService,
    private readonly registrationRequestRepository: RegistrationRequestRepository,
    private readonly clientRepository: ClientRepository,
    private readonly unitOfWork: PrismaUnitOfWork,
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

  async createClientUserWithRegistrationRequestAsync(
    userCreationDto: UserCreationDto,
  ) {
    if (
      await this.userRepository.checkIfExistsByEmailAsync(userCreationDto.email)
    ) {
      throw new BadRequestException(
        'Este email ya se encuentra registrado. Por favor, usá otro email o iniciá sesión.',
      );
    }
    return this.unitOfWork.execute(async (tx: Prisma.TransactionClient) => {
      const { companyName, taxCategoryId, ...userData } = userCreationDto;
      const hashedPassword = await this.hashPasswordAsync(userData.password);
      const user = {
        ...userData,
        password: hashedPassword,
        role: { connect: { id: RoleIds.Employee } },
      } as Prisma.UserCreateInput;

      const newUser = await this.userRepository.createUserAsync(user, tx);

      const client = {
        user: { connect: { id: newUser.id } },
        companyName,
        taxCategory: { connect: { id: taxCategoryId } },
      };

      const newClient = await this.clientRepository.createClientAsync(
        client,
        tx,
      );

      const userCreationResponseDto: UserCreationResponse = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        companyName: newClient.companyName,
        documentType: newUser.documentType,
        documentNumber: newUser.documentNumber,
        phone: newUser.phone,
        taxCategoryName: newClient.taxCategory.name,
      };

      await this.registrationRequestRepository.createRegistrationRequestAsync(
        {
          user: { connect: { id: newUser.id } },
          status: { connect: { id: RegistrationRequestStatusId.Pending } },
        },
        tx,
      );

      return userCreationResponseDto;
    });
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

  async updateUserByIdAsync(id: number, userUpdateDto: Prisma.UserUpdateInput) {
    return this.userRepository.updateUserByIdAsync(id, userUpdateDto);
  }

  async incrementFailedLoginAttemptsAsync(id: number) {
    const user =
      await this.userRepository.incrementFailedLoginAttemptsAsync(id);
    return user.failedLoginAttempts;
  }

  async updateAccountLockedUntilAsync(id: number, lockedUntil: Date) {
    return this.userRepository.updateAccountLockedUntilAsync(id, lockedUntil);
  }

  async resetFailedLoginAttemptsAndLockedUntilAsync(id: number) {
    return this.userRepository.resetFailedLoginAttemptsAndLockedUntilAsync(id);
  }
}
