import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsNumber } from 'class-validator';

export class CountryDto {
    @ApiProperty({ example: '1234' })
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @ApiProperty({ example: 'Argentina' }) 
    @IsString()
    @IsNotEmpty()
    @MaxLength(56)
    name: string;
}