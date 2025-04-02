import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class RejectRegistrationRequestDto {
  @ApiProperty({
    example: '',
    description: 'The note to add to the registration request',
    required: true,
    maxLength: 50,
  })
  @IsString()
  @Length(0, 50)
  note?: string;
}
