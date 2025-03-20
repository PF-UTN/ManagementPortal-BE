import { RegistrationRequestStatus } from '@mp/common/constants';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class SearchRegistrationRequestFiltersDto {
  @ApiProperty({
    example: ['Pending'],
    description: 'Filter by the status of the registration requests',
    required: false,
  })
  @IsEnum(RegistrationRequestStatus)
  @IsNotEmpty()
  status?: string[];
}
