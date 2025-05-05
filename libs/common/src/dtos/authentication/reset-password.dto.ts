import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { IsStrongPasswordCustom } from '@mp/common/decorators';

export class ResetPasswordDto {
  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsStrongPasswordCustom()
  password: string;
}
