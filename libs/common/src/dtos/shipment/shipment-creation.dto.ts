import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsDate, IsNumber, Min } from 'class-validator';

export class ShipmentCreationDto {
  @ApiProperty({
    description: 'Date of the shipment',
    example: '1990-01-15',
    required: true,
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({
    description: 'ID of the vehicle that will make the shipment',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  vehicleId: number;

  @ApiProperty({
    description: 'ID of the orders to be delivered in the shipment',
    example: [1, 2],
    required: true,
    type: [Number],
  })
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  orderIds: number[];
}
