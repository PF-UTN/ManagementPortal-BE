import { Prisma } from "@prisma/client";

export class RegistrationRequestCreationDto {
    note: string;
    status: Prisma.RegistrationRequestStatusCreateNestedOneWithoutRegistrationRequestInput;
    user: Prisma.UserCreateNestedOneWithoutRegistrationRequestInput;
}