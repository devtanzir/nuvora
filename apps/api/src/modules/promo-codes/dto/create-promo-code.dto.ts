import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreatePromoCodeDto {
  @ApiProperty({ example: 'EID50' })
  @IsString()
  code!: string;

  @ApiProperty({ enum: DiscountType, example: 'FIXED' })
  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  discountValue!: number;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ example: '2026-06-30T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
