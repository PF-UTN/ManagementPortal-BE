import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'password123' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  confirmPassword: string;
}
