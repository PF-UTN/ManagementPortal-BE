import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { RegistrationRequestStatusId, RoleIds } from '@mp/common/constants';
import {
  ClientCreationDto,
  UserCreationDto,
  UserCreationResponse,
} from '@mp/common/dtos';
import { EncryptionService } from '@mp/common/services';
import {
  AddressRepository,
  ClientRepository,
  PrismaUnitOfWork,
  RegistrationRequestRepository,
  UserRepository,
} from '@mp/repository';

import { TownService } from '../town/town.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly encryptionService: EncryptionService,
    private readonly registrationRequestRepository: RegistrationRequestRepository,
    private readonly clientRepository: ClientRepository,
    private readonly addressRepository: AddressRepository,
    private readonly unitOfWork: PrismaUnitOfWork,
    private readonly townService: TownService,
  ) {}

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

    const { companyName, taxCategoryId, address, ...userData } =
      userCreationDto;

    if (!(await this.townService.existsAsync(address.townId))) {
      throw new BadRequestException(
        'El id de la localidad proporcionado no se encuentra registrado.',
      );
    }

    const hashedPassword = await this.hashPasswordAsync(userData.password);

    return this.unitOfWork.execute(async (tx: Prisma.TransactionClient) => {
      const user = {
        ...userData,
        password: hashedPassword,
        role: { connect: { id: RoleIds.Client } },
      };

      const newUser = await this.userRepository.createUserAsync(user, tx);

      const newAddress = await this.addressRepository.createAddressAsync(
        address,
        tx,
      );

      const client: ClientCreationDto = {
        userId: newUser.id,
        companyName: companyName,
        taxCategoryId: taxCategoryId,
        addressId: newAddress.id,
      };

      const newClient = await this.clientRepository.createClientAsync(
        client,
        tx,
      );

      await this.registrationRequestRepository.createRegistrationRequestAsync(
        {
          user: { connect: { id: newUser.id } },
          status: { connect: { id: RegistrationRequestStatusId.Pending } },
        },
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
        birthdate: newUser.birthdate,
        taxCategoryName: newClient.taxCategory.name,
      };

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
