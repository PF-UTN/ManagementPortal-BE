import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

import { IsStrongPasswordCustom } from '@mp/common/decorators';

import { UserDocumentTypes } from '../../constants';

export class UserCreationDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @MaxLength(250)
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsStrongPasswordCustom()
  password: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: '11222333' })
  @IsNumberString()
  @IsNotEmpty()
  @Length(7, 11)
  documentNumber: string;

  @ApiProperty({ example: 'DNI' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4)
  @IsEnum(UserDocumentTypes)
  documentType: string;

  @ApiProperty({ example: 'Calle Falsa' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  street: string;

  @ApiProperty({ example: 123 })
  @IsNotEmpty()
  streetNumber: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  townId: number;  
}
