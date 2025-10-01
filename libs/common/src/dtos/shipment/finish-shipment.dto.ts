import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsDate,
  IsNumber,
  ValidateNested,
  IsArray,
} from 'class-validator';

import { FinishShipmentOrdersDto } from './finish-shipment-orders.dto';

export class FinishShipmentDto {
  @ApiProperty({
    description: 'Date of the shipment',
    example: '2025-04-08 11:36:48',
    required: true,
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  finishedAt: Date;

  @ApiProperty({
    description: 'Odometer value of the vehicle that made the shipment',
    example: 105213,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  odometer: number;

  @ApiProperty({ type: FinishShipmentOrdersDto })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinishShipmentOrdersDto)
  orders: FinishShipmentOrdersDto[];
}
