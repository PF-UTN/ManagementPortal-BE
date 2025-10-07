import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class SearchShipmentFiltersDto {
  @ApiProperty({
    example: ['Pending', 'Shipped'],
    description: 'Filter by order status name',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  statusName?: string[];

  @ApiProperty({
    example: '2024-07-01',
    description:
      'Start date of the shipment filter (shipments made on or after this date)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({
    example: '2024-07-31',
    description:
      'End date of the shipment filter (shipments made on or before this date)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiProperty({
    example: '1',
    description: 'Vehicle ID to filter shipments',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  vehicleId?: number;
}
