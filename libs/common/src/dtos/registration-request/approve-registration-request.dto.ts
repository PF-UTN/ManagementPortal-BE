import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class ApproveRegistrationRequestDto {
  @ApiProperty({
    example: '',
    description: 'The note to add to the registration request',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  note?: string;
}
