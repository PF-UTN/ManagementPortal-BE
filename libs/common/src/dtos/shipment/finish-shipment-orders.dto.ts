import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min, IsEnum } from 'class-validator';

import { OrderStatusId } from '@mp/common/constants';

export class FinishShipmentOrdersDto {
  @ApiProperty({
    description: 'ID of the order',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  orderId: number;

  @ApiProperty({
    description: 'New status of the order',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(OrderStatusId)
  orderStatusId: number;
}
