import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { PurchaseOrderItemDto } from '../purchase-order-item';

export class PurchaseOrderUpdateDto {
  @ApiProperty({ example: '1990-01-15', type: String, format: 'date' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  estimatedDeliveryDate: Date;

  @ApiProperty({ example: '1990-01-15', type: String, format: 'date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  effectiveDeliveryDate: Date | null;

  @ApiProperty({
    example: 'Purchase order for office supplies',
    required: false,
  })
  @IsOptional()
  @IsString()
  observation: string;

  @ApiProperty({ example: 1, required: true })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  purchaseOrderStatusId: number;

  @ApiProperty({ type: [PurchaseOrderItemDto] })
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  purchaseOrderItems: PurchaseOrderItemDto[];
}
