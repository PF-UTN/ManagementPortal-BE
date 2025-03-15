import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UserSignInDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @MaxLength(250)
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  password: string;
}
