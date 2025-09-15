import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class MaintenanceItemCreationDto {
  @ApiProperty({
    example: 'Filter change',
    description: 'The description of the maintenance',
    required: true,
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;
}
