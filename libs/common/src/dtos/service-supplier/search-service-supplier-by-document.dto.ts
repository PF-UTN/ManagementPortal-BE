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

export class SearchServiceSupplierByDocumentDto {
  @ApiProperty({ example: 'DNI' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4)
  @IsEnum(UserDocumentTypes)
  documentType: string;

  @ApiProperty({ example: 12345678 })
  @IsNumberString()
  @IsNotEmpty()
  @Length(7, 11)
  documentNumber: string;
}
