import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateVariantDto {
  @ApiProperty({ example: 'Size' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'XXL' })
  @IsString()
  value!: string;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(0)
  stock!: number;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsNumber()
  price?: number;
}
