import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBannerDto {
  @ApiProperty({ example: 'Summer Sale - Up to 50% Off' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'https://img.magnific.com/free-photo/amazed-young-woman-shopaholic-holding-colorful-shopping-bags-look-amused-shop-buying-thi_1258-119761.jpg?t=st=1778624047~exp=1778627647~hmac=6a10f0ea9b30351f2ae07f4d004240c4292f1ca1d92d108ad73a7e8b649971b4&w=1480' })
  @IsString()
  imageUrl!: string;

  @ApiPropertyOptional({ example: '/products?sale=true' })
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number = 0;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
