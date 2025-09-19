import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';

import { DeliveryMethodId } from '@mp/common/constants';

import { OrderStatusId } from '../../constants/order-status.constant';
import { OrderItemDto } from '../order-item/order-item.dto';
import { PaymentDetailDataDto } from '../payment-detail';

export class OrderCreationDto {
  @ApiProperty({
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  clientId: number;

  @ApiProperty({
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsEnum(OrderStatusId)
  orderStatusId: OrderStatusId;

  @ApiProperty({
    example: {
      paymentTypeId: 1,
    },
    required: true,
    type: PaymentDetailDataDto,
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => PaymentDetailDataDto)
  paymentDetail: PaymentDetailDataDto;

  @ApiProperty({ example: 1, required: true })
  @IsNotEmpty()
  @IsNumber()
  @IsEnum(DeliveryMethodId)
  deliveryMethodId: DeliveryMethodId;

  @ApiProperty({ type: [OrderItemDto] })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];
}
