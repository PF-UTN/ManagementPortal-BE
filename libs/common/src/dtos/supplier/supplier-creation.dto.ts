import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { UserDocumentTypes } from '@mp/common/constants';

import { AddressCreationDto } from '../authentication';

export class SupplierCreationDto {
  @ApiProperty({ example: 'Pampa Nutrición' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  businessName: string;

  @ApiProperty({ example: 'DNI' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4)
  @IsEnum(UserDocumentTypes)
  documentType: string;

  @ApiProperty({ example: '11222333' })
  @IsNumberString()
  @IsNotEmpty()
  @Length(7, 11)
  documentNumber: string;

  @ApiProperty({ example: 'contacto@pampanutricion.com' })
  @IsEmail()
  @MaxLength(250)
  email: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ type: AddressCreationDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressCreationDto)
  address: AddressCreationDto;
}
