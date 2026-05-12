import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

export class BannerOrderItemDto {
  @ApiProperty({ example: 'cuid' })
  @IsString()
  id!: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  order!: number;
}

export class ReorderBannersDto {
  @ApiProperty({ type: [BannerOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BannerOrderItemDto)
  banners!: BannerOrderItemDto[];
}
