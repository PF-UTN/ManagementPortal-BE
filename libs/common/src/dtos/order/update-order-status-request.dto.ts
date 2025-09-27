import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { OrderStatusId } from '@mp/common/constants';

export class UpdateOrderStatusRequestDto {
  @ApiProperty({ example: 1, required: true })
  @IsNotEmpty()
  @IsEnum(OrderStatusId)
  orderStatusId: number;
}
