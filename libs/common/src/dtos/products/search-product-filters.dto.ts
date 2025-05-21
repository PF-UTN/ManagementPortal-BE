import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateIf } from 'class-validator';

export class SearchProductFiltersDto {
    @ApiProperty({
        example: ['Electronics, Home'],
        description: 'Filter by product category descriptions',
        required: false,
    })
    @IsArray()
    @IsString({ each: true })
    @ValidateIf((o) => o.categoryDescriptions?.length > 0)
    categoryDescriptions?: string[];

    @ApiProperty({
        example: ['Proveedor A', 'Proveedor B'],
        description: 'Filter by product provider descriptions',
        required: false,
    })
    @IsArray()
    @IsString({ each: true })
    @ValidateIf((o) => o.providerDescription?.length > 0)
    providerDescription?: string[];

    @ApiProperty({
        example: true,
        description: 'Filter by enabled status',
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;
}