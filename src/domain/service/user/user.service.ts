import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { RegistrationRequestStatusId, RoleIds } from '@mp/common/constants';
import { UserCreationDto } from '@mp/common/dtos';
import { EncryptionService } from '@mp/common/services';
import {
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
    private readonly unitOfWork: PrismaUnitOfWork,
  ) { }

  async createUserAsync(userCreationDto: UserCreationDto): Promise<User> {
    const hashedPassword = await this.hashPasswordAsync(
      userCreationDto.password,
    );

    const user = {
      firstName: userCreationDto.firstName,
      lastName: userCreationDto.lastName,
      email: userCreationDto.email,
      password: hashedPassword,
      phone: userCreationDto.phone,
      documentType: userCreationDto.documentType,
      documentNumber: userCreationDto.documentNumber,
      role: { connect: { id: RoleIds.Employee } },
    } as Prisma.UserCreateInput;

    const newUser = await this.userRepository.createUserAsync(user);
    return newUser;
  }

  async createUserWithRegistrationRequestAsync(
    userCreationDto: UserCreationDto,
  ) {
    if (isNaN(Number(userCreationDto.streetNumber))) {
      throw new BadRequestException('El número de calle debe ser numérico.');
    }
    if (isNaN(Number(userCreationDto.townId))) {
      throw new BadRequestException('El id de la localidad debe ser numérico.');
    }
    const foundUser = await this.userRepository.findByEmailAsync(
      userCreationDto.email,
    );
    if (foundUser) {
      throw new BadRequestException(
        'Este email ya se encuentra registrado. Por favor, usá otro email o iniciá sesión.',
      );
    }
    return this.unitOfWork.execute(async (tx: Prisma.TransactionClient) => {
      const town = await this.unitOfWork.prisma.town.findUnique({
        where: { id: userCreationDto.townId },
      });
      if (!town) {
        throw new BadRequestException(
          'El id de la localidad proporcionado no es válido.',
        );
      }
      const hashedPassword = await this.hashPasswordAsync(
        userCreationDto.password,
      );

      const user = await this.userRepository.createUserAsync({
        firstName: userCreationDto.firstName,
        lastName: userCreationDto.lastName,
        email: userCreationDto.email,
        password: hashedPassword,
        phone: userCreationDto.phone,
        documentType: userCreationDto.documentType,
        documentNumber: userCreationDto.documentNumber,
        role: { connect: { id: RoleIds.Employee } },
      });

      const address = await this.unitOfWork.prisma.address.create({
        data: {
          street: userCreationDto.street,
          streetNumber: userCreationDto.streetNumber,
          townId: userCreationDto.townId,
          userId: user.id,
        },
      });

      const updatedUser = await this.userRepository.updateUserByIdAsync(user.id, {
        address: { connect: { id: address.id } },
      });

      await this.registrationRequestRepository.createRegistrationRequestAsync(
        {
          user: { connect: { id: updatedUser.id } },
          status: { connect: { id: RegistrationRequestStatusId.Pending } },
        },
        tx,
      );

      return updatedUser;
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
