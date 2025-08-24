import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { PurchaseOrderStatusId } from '../../constants';

export class UpdatePurchaseOrderStatusRequestDto {
  @ApiProperty({ example: 1, required: true })
  @IsNotEmpty()
  @IsEnum(PurchaseOrderStatusId)
  purchaseOrderStatusId: number;

  @ApiProperty({
    example: 'Purchase order requires manager approval',
    description:
      'Observation or notes related to the purchase order cancellation',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  observation?: string;

  @ApiProperty({ example: '1990-01-15', type: String, format: 'date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  effectiveDeliveryDate?: Date;
}
