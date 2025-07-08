import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { OrderDirection, ProductOrderField } from '@mp/common/constants';

export class ProductSortDto {
  @ApiProperty({ example: 'NAME' })
  @IsEnum(ProductOrderField)
  field: ProductOrderField;

  @ApiProperty({ example: 'ASC' })
  @IsEnum(OrderDirection)
  direction: OrderDirection;
}