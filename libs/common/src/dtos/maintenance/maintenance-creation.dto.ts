import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsDate, IsNumber, Min } from 'class-validator';

export class MaintenanceCreationDto {
  @ApiProperty({
    description: 'Date the maintenance was performed',
    example: '1990-01-15',
    type: String,
    format: 'date',
    required: true,
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({
    description:
      'Kilometers the vehicle had when the maintenance was performed',
    example: 10000,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  kmPerformed: number;

  @ApiProperty({
    description: 'ID of the maintenance plan item that was performed',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  maintenancePlanItemId: number;

  @ApiProperty({
    description: 'ID of the supplier who performed the maintenance',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  serviceSupplierId: number;
}
