import { Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUserAsync(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findByIdAsync(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findByEmailAsync(email: string): Promise<Prisma.UserGetPayload<{
    include: {
      role: { include: { rolePermissions: { include: { permission: true } } } };
    };
  }> | null> {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        role: {
          include: { rolePermissions: { include: { permission: true } } },
        },
      },
    });
  }

  async updateUserByIdAsync(
    id: number,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    return this.prisma.user.update({
      where: {
        id,
      },
      data,
    });
  }

  async incrementFailedLoginAttemptsAsync(id: number): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        failedLoginAttempts: {
          increment: 1,
        },
      },
    });
  }

  async updateAccountLockedUntilAsync(
    id: number,
    lockedUntil: Date,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        accountLockedUntil: lockedUntil,
      },
    });
  }

  async resetFailedLoginAttemptsAndLockedUntilAsync(
    id: number,
  ) {
    return this.prisma.user.update({
      where: { id },
      data: {
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      },
    });
  }
}
