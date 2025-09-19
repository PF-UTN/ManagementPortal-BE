import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ServiceSupplier } from '@prisma/client';

import {
  ServiceSupplierCreationDataDto,
  ServiceSupplierCreationDto,
} from '@mp/common/dtos';
import {
  AddressRepository,
  PrismaUnitOfWork,
  ServiceSupplierRepository,
} from '@mp/repository';

import { SearchServiceSupplierQuery } from '../../../controllers/service-supplier/query/search-service-supplier.query';
import { TownService } from '../town/town.service';

@Injectable()
export class ServiceSupplierService {
  constructor(
    private readonly serviceSupplierRepository: ServiceSupplierRepository,
    private readonly addressRepository: AddressRepository,
    private readonly townService: TownService,
    private readonly unitOfWork: PrismaUnitOfWork,
  ) {}

  async createOrUpdateServiceSupplierAsync(
    serviceSupplierCreationDto: ServiceSupplierCreationDto,
  ) {
    const { address, ...serviceSupplierCreationData } =
      serviceSupplierCreationDto;

    const existsTown = await this.townService.existsAsync(address.townId);

    if (!existsTown) {
      throw new NotFoundException(
        `Town with id ${address.townId} does not exist.`,
      );
    }

    const foundServiceSupplier =
      await this.serviceSupplierRepository.findByDocumentAsync(
        serviceSupplierCreationDto.documentType,
        serviceSupplierCreationDto.documentNumber,
      );

    const existsEmail = await this.serviceSupplierRepository.findByEmailAsync(
      serviceSupplierCreationDto.email,
    );

    return this.unitOfWork.execute(async (tx: Prisma.TransactionClient) => {
      if (foundServiceSupplier) {
        if (existsEmail && existsEmail.id !== foundServiceSupplier.id) {
          throw new BadRequestException(
            `Service supplier with email ${serviceSupplierCreationDto.email} already exists.`,
          );
        }

        const updatedAddress = await this.addressRepository.updateAddressAsync(
          foundServiceSupplier.addressId,
          address,
          tx,
        );

        const serviceSupplierData: ServiceSupplierCreationDataDto = {
          ...serviceSupplierCreationData,
          addressId: updatedAddress.id,
        };

        return this.serviceSupplierRepository.updateServiceSupplierAsync(
          foundServiceSupplier.id,
          serviceSupplierData,
          tx,
        );
      }

      if (existsEmail) {
        throw new BadRequestException(
          `ServiceSupplier with email ${serviceSupplierCreationDto.email} already exists.`,
        );
      }

      const newAddress = await this.addressRepository.createAddressAsync(
        address,
        tx,
      );

      const serviceSupplierData: ServiceSupplierCreationDataDto = {
        ...serviceSupplierCreationData,
        addressId: newAddress.id,
      };

      return this.serviceSupplierRepository.createServiceSupplierAsync(
        serviceSupplierData,
        tx,
      );
    });
  }

  async searchByTextAsync(query: SearchServiceSupplierQuery) {
    return await this.serviceSupplierRepository.searchByTextAsync(
      query.searchText,
      query.page,
      query.pageSize,
    );
  }

  async findByIdAsync(id: number): Promise<ServiceSupplier | null> {
    const serviceSupplier =
      await this.serviceSupplierRepository.findByIdAsync(id);
    if (!serviceSupplier) {
      throw new NotFoundException(
        `Service supplier with id ${id} does not exist.`,
      );
    }

    return serviceSupplier;
  }
}
