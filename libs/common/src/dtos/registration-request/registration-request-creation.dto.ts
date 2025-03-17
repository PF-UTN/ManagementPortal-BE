import { Prisma } from '@prisma/client';
import { IsString, Length } from 'class-validator';

export class RegistrationRequestCreationDto {
  @IsString()
  @Length(0, 50)
  note: string;
  status: Prisma.RegistrationRequestStatusCreateNestedOneWithoutRegistrationRequestInput;
  user: Prisma.UserCreateNestedOneWithoutRegistrationRequestInput;
}
