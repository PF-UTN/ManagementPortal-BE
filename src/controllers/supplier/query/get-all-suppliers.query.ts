import { Query } from '@nestjs/cqrs';
import { Supplier } from '@prisma/client';

export class GetAllSuppliersQuery extends Query<Supplier[]> {}
