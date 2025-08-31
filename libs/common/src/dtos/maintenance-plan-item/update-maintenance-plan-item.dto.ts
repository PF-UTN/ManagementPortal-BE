import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateMaintenancePlanItemDto {
  @ApiProperty({ example: 1, required: true })
  @IsNotEmpty()
  @IsNumber()
  maintenanceItemId: number;

  @ApiProperty({ example: 10000, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  kmInterval: number | null;

  @ApiProperty({ example: 6, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  timeInterval: number | null;
}
