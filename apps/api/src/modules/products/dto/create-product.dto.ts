import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductImageDto {
  @ApiProperty({ example: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2Zu3VKYKYJzZLzSPZ0_IbdkER1yc9MdYNyQ&s' })
  @IsString()
  url!: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  order!: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isPrimary!: boolean;
}

export class ProductVariantDto {
  @ApiProperty({ example: 'Size' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'XL' })
  @IsString()
  value!: string;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0)
  stock!: number;

  @ApiPropertyOptional({ example: 1300 })
  @IsOptional()
  @IsNumber()
  price?: number;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Premium Cotton Shirt' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'High quality cotton shirt...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1200 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: 1500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiProperty({ example: 'cuid' })
  @IsString()
  categoryId!: string;

  @ApiProperty({ type: [ProductImageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images!: ProductImageDto[];

  @ApiPropertyOptional({ type: [ProductVariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];
}
