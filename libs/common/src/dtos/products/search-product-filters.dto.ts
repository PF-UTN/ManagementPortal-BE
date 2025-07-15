import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateIf } from 'class-validator';

export class SearchProductFiltersDto {
    @ApiProperty({
        example: ['Electronics', 'Home'],
        description: 'Filter by product category descriptions',
        required: false,
    })
    @IsArray()
    @IsString({ each: true })
    @ValidateIf((o) => o.categoryName?.length > 0)
    categoryName?: string[];

    @ApiProperty({
        example: ['Proveedor A', 'Proveedor B'],
        description: 'Filter by product provider descriptions',
        required: false,
    })
    @IsArray()
    @IsString({ each: true })
    @ValidateIf((o) => o.supplierBusinessName?.length > 0)
    supplierBusinessName?: string[];

    @ApiProperty({
        example: true,
        description: 'Filter by enabled status',
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;
}