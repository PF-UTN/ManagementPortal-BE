import { RegistrationRequestStatusRepository } from '@mp/repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RegistrationRequestStatusService {
  constructor(
    private readonly registrationRequestStatusRepository: RegistrationRequestStatusRepository,
  ) {}

  async findByCodeAsync(code: string) {
    return this.registrationRequestStatusRepository.findByCodeAsync(code);
  }
}
