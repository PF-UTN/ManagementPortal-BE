import { Prisma } from '@prisma/client';
import { IsOptional, IsString, Length } from 'class-validator';

export class RegistrationRequestCreationDto {
  @IsOptional()
  @IsString()
  @Length(0, 50)
  note?: string;
  status: Prisma.RegistrationRequestStatusCreateNestedOneWithoutRegistrationRequestsInput;
  user: Prisma.UserCreateNestedOneWithoutRegistrationRequestInput;
}
