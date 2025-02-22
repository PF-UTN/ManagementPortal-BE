import { ApiProperty } from '@nestjs/swagger';

export class UserCreationDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'password123' })
  password: string;

  @ApiProperty({ example: '+1234567890' })
  phone: string;
}
