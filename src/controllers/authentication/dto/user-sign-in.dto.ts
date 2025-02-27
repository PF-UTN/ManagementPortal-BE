import { ApiProperty } from '@nestjs/swagger';

export class UserSignInDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;
  
  @ApiProperty({ example: 'password123' })
  password: string;
}
