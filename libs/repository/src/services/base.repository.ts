import { PrismaClient, PrismaPromise } from "@prisma/client";
import { PrismaService } from "./prisma.service";

export abstract class BaseRepository<T, K extends keyof PrismaClient> {
  constructor(protected readonly prisma: PrismaService, private readonly model: K) {}

  private get modelDelegate() {
    return this.prisma[this.model] as any;
  }

  createAsync(entity: T): PrismaPromise<T> {
    return this.modelDelegate.create({ data: entity }) as PrismaPromise<T>;
  }

  findAllAsync(): PrismaPromise<T[]> {
    return this.modelDelegate.findMany() as PrismaPromise<T[]>;
  }

  findOneByIdAsync(id: number): PrismaPromise<T | null> {
    return this.modelDelegate.findUnique({ where: { id } }) as PrismaPromise<T | null>;
  }

  updateAsync(id: number, entity: Partial<T>): PrismaPromise<T> {
    return this.modelDelegate.update({
      where: { id },
      data: entity,
    }) as PrismaPromise<T>;
  }

  deleteByIdAsync(id: number): PrismaPromise<T> {
    return this.modelDelegate.delete({ where: { id } }) as PrismaPromise<T>;
  }
}
