import { Injectable } from '@nestjs/common';

import { RegistrationRequestStatusRepository } from '@mp/repository';

@Injectable()
export class RegistrationRequestStatusService {
  constructor(
    private readonly registrationRequestStatusRepository: RegistrationRequestStatusRepository,
  ) {}

  async findByCodeAsync(code: string) {
    return this.registrationRequestStatusRepository.findByCodeAsync(code);
  }
}
