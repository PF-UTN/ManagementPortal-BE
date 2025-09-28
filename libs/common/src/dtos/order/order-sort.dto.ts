import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { OrderDirection, OrderField } from '@mp/common/constants';

export class OrderSortDto {
  @ApiProperty({ example: 'createdAt' })
  @IsEnum(OrderField)
  field: OrderField;

  @ApiProperty({ example: 'asc' })
  @IsEnum(OrderDirection)
  direction: OrderDirection;
}
