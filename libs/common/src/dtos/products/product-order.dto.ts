import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class ProductOrderDto {
  @ApiProperty({ enum: ['name', 'price'], example: 'name' })
  @IsIn(['name', 'price'])
  field: 'name' | 'price';

  @ApiProperty({ enum: ['asc', 'desc'], example: 'asc' })
  @IsIn(['asc', 'desc'])
  direction: 'asc' | 'desc';
}