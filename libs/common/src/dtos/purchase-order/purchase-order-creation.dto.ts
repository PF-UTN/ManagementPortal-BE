import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { PurchaseOrderStatusId } from '@mp/common/constants';

import { PurchaseOrderItemDto } from '../purchase-order-item';

export class PurchaseOrderCreationDto {
  @ApiProperty({ example: 1, required: true })
  @IsNotEmpty()
  @IsNumber()
  supplierId: number;

  @ApiProperty({ example: '1990-01-15', type: String, format: 'date' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  estimatedDeliveryDate: Date;

  @ApiProperty({
    example: 'Purchase order for office supplies',
    required: false,
  })
  @IsOptional()
  @IsString()
  observation: string;

  @ApiProperty({ type: [PurchaseOrderItemDto] })
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  purchaseOrderItems: PurchaseOrderItemDto[];

  @ApiProperty({ example: 1, required: true })
  @IsNotEmpty()
  @IsNumber()
  @IsEnum(PurchaseOrderStatusId)
  purchaseOrderStatusId: PurchaseOrderStatusId;
}
