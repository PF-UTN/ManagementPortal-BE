import { SearchRegistrationRequestFiltersDto } from '@mp/common/dtos';
import { Injectable } from '@nestjs/common';
import { Prisma, RegistrationRequest } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class RegistrationRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async searchWithFiltersAsync(
    searchText: string,
    filters: SearchRegistrationRequestFiltersDto,
    page: number,
    pageSize: number,
  ) {
    return this.prisma.registrationRequest.findMany({
      where: {
        AND: [
          filters.status?.length
            ? {
                status: {
                  is: {
                    code: { in: filters.status },
                  },
                },
              }
            : {},
          {
            OR: [
              {
                user: {
                  firstName: {
                    contains: searchText,
                    mode: 'insensitive',
                  },
                },
              },
              {
                user: {
                  lastName: {
                    contains: searchText,
                    mode: 'insensitive',
                  },
                },
              },
              {
                user: {
                  email: {
                    contains: searchText,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        status: true,
        user: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { requestDate: 'desc' },
    });
  }

  async createRegistrationRequestAsync(
    data: Prisma.RegistrationRequestCreateInput,
  ): Promise<RegistrationRequest> {
    return this.prisma.registrationRequest.create({
      data,
    });
  }

  async findRegistrationRequestWithStatusByIdAsync(
    registrationRequestId: number,
  ) {
    return this.prisma.registrationRequest.findUnique({
      where: { id: registrationRequestId },
      include: { status: true },
    });
  }

  async findRegistrationRequestWithDetailsByIdAsync(
    registrationRequestId: number,
  ) {
    return this.prisma.registrationRequest.findUnique({
      where: { id: registrationRequestId },
      include: { status: true, user: true },
    });
  }

  async updateRegistrationRequestStatusAsync(
    registrationRequestId: number,
    data: Prisma.RegistrationRequestUpdateInput,
  ) {
    return this.prisma.registrationRequest.update({
      where: { id: registrationRequestId },
      data,
    });
  }
}
