import { SearchRegistrationRequestFiltersDto } from '@mp/common/dtos';
import { Injectable } from '@nestjs/common';
import { RegistrationRequest } from '@prisma/client';
import { BaseRepository } from '../base.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RegistrationRequestRepository extends BaseRepository<RegistrationRequest, 'registrationRequest'> {
    constructor(prisma: PrismaService) {
        super(prisma, 'registrationRequest');
    }

    async searchWithFiltersAsync(
        searchText: string,
        filters: SearchRegistrationRequestFiltersDto
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
                    }
                ],
            },
            include: {
                status: true,
                user: true,
            },
            orderBy: { requestDate: 'desc' },
        });
    }
}
