import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Electronic products' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://www.shutterstock.com/image-illustration/group-home-appliances-consumer-electronics-600nw-2451385301.jpg' })
  @IsOptional()
  @IsString()
  image?: string;
}
