import { Prisma } from '@prisma/client';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateRegistrationRequestStatusDto {
  @IsNotEmpty()
  @IsNumber()
  registrationRequestId: number;
  @IsNotEmpty()
  status: Prisma.RegistrationRequestStatusCreateNestedOneWithoutRegistrationRequestsInput;
  @IsOptional()
  @IsString()
  @Length(0, 50)
  note?: string;
}
