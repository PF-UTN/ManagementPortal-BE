import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { OrderDirection, PurchaseOrderField } from '@mp/common/constants';

export class PurchaseOrderSortDto {
  @ApiProperty({ example: 'createdAt' })
  @IsEnum(PurchaseOrderField)
  field: PurchaseOrderField;

  @ApiProperty({ example: 'asc' })
  @IsEnum(OrderDirection)
  direction: OrderDirection;

}