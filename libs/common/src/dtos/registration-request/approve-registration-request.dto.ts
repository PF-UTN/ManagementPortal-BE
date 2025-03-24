import { IsOptional, IsString, Length } from 'class-validator';

export class ApproveRegistrationRequestDto {
  @IsOptional()
  @IsString()
  @Length(0, 50)
  note?: string;
}
