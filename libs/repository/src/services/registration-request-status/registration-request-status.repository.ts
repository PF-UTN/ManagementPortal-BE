import { Injectable } from '@nestjs/common';
import { RegistrationRequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RegistrationRequestStatusRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByCodeAsync(code: string): Promise<RegistrationRequestStatus | null> {
        return this.prisma.registrationRequestStatus.findUnique({
            where: {
                code,
            },
        });
    }
}
