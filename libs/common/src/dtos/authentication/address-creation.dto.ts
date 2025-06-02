import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class AddressCreationDto {
  @ApiProperty({ example: 'Calle Falsa' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  street: string;

  @ApiProperty({ example: 123 })
  @IsNotEmpty()
  @IsNumber()
  streetNumber: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  townId: number;
}