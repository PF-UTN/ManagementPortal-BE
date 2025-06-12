import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Supplier } from '@prisma/client';

import { SupplierCreationDataDto, SupplierCreationDto } from '@mp/common/dtos';
import {
  AddressRepository,
  PrismaUnitOfWork,
  SupplierRepository,
} from '@mp/repository';

import { TownService } from '../town/town.service';

@Injectable()
export class SupplierService {
  constructor(
    private readonly supplierRepository: SupplierRepository,
    private readonly addressRepository: AddressRepository,
    private readonly townService: TownService,
    private readonly unitOfWork: PrismaUnitOfWork,
  ) {}

  async existsAsync(id: number): Promise<boolean> {
    return this.supplierRepository.existsAsync(id);
  }

  async getAllSuppliersAsync(): Promise<Supplier[]> {
    return this.supplierRepository.getAllSuppliersAsync();
  }

  async createOrUpdateSupplierAsync(supplierCreationDto: SupplierCreationDto) {
    const { address, ...supplierCreationData } = supplierCreationDto;

    const existsTown = await this.townService.existsAsync(address.townId);

    if (!existsTown) {
      throw new BadRequestException(
        `Town with id ${address.townId} does not exist.`,
      );
    }

    const foundSupplier = await this.supplierRepository.findByDocumentAsync(
      supplierCreationDto.documentType,
      supplierCreationDto.documentNumber,
    );

    const existsEmail = await this.supplierRepository.findByEmailAsync(
      supplierCreationDto.email,
    );

    return this.unitOfWork.execute(async (tx: Prisma.TransactionClient) => {
      if (foundSupplier) {
        if (existsEmail && existsEmail.id !== foundSupplier.id) {
          throw new BadRequestException(
            `Supplier with email ${supplierCreationDto.email} already exists.`,
          );
        }

        const updatedAddress = await this.addressRepository.updateAddressAsync(
          foundSupplier.addressId,
          address,
          tx,
        );

        const supplierData: SupplierCreationDataDto = {
          ...supplierCreationData,
          addressId: updatedAddress.id,
        };

        return this.supplierRepository.updateSupplierAsync(
          foundSupplier.id,
          supplierData,
          tx,
        );
      }

      if (existsEmail) {
        throw new BadRequestException(
          `Supplier with email ${supplierCreationDto.email} already exists.`,
        );
      }

      const newAddress = await this.addressRepository.createAddressAsync(
        address,
        tx,
      );

      const supplierData: SupplierCreationDataDto = {
        ...supplierCreationData,
        addressId: newAddress.id,
      };

      return this.supplierRepository.createSupplierAsync(supplierData, tx);
    });
  }
}
