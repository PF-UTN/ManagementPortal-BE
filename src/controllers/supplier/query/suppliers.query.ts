import { Query } from '@nestjs/cqrs';
import { Supplier } from '@prisma/client';

export class SuppliersQuery extends Query<Supplier[]> {}
