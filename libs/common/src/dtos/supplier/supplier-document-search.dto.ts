import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

import { UserDocumentTypes } from '@mp/common/constants';

export class SupplierDocumentSearchDto {
  @ApiProperty({ example: 'CUIT' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4)
  @IsEnum(UserDocumentTypes)
  documentType: string;

  @ApiProperty({ example: '12345678901' })
  @IsNumberString()
  @IsNotEmpty()
  @Length(7, 11)
  documentNumber: string;
}
