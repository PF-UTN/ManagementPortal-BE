import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ProductToggleDto {
  @ApiProperty({
    description: 'Indicates whether the product is enabled or disabled',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  enabled: boolean;
}
