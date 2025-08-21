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
} from 'class-validator';

export class UpdatePurchaseOrderStatusRequestDto {
  @ApiProperty({ example: 1, required: true })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
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
