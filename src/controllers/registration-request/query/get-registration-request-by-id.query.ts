import { Query } from '@nestjs/cqrs';

export class GetRegistrationRequestByIdQuery extends Query<void> {
  constructor(public readonly id: number) {
    super();
  }
}
