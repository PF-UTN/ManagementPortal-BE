import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class MaintenancePlanItemCreationDto {
  @ApiProperty({ example: 1, required: true })
  @IsNotEmpty()
  @IsNumber()
  vehicleId: number;

  @ApiProperty({ example: 1, required: true })
  @IsNotEmpty()
  @IsNumber()
  maintenanceItemId: number;

  @ApiProperty({ example: 10000, required: false })
  @IsNumber()
  kmInterval: number | null;

  @ApiProperty({ example: 6, required: false })
  @IsNumber()
  timeInterval: number | null;
}
