import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, MaxLength } from 'class-validator';

export class UpdateMaintenanceItemDto {
  @ApiProperty({
    example: 'Filter change',
    description: 'The description of the maintenance',
    required: true,
  })
  @IsDefined()
  @IsString()
  @MaxLength(500)
  description: string;
}
