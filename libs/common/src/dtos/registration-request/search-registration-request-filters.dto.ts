import { RegistrationRequestStatus } from '@mp/common/constants';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, ValidateIf } from 'class-validator';

export class SearchRegistrationRequestFiltersDto {
  @ApiProperty({
    example: ['Pending'],
    description: 'Filter by the status of the registration requests',
    required: false,
  })
  @IsArray()
  @ValidateIf((o) => o.status?.length > 0)
  @IsEnum(RegistrationRequestStatus, { each: true })
  status?: string[];
}
