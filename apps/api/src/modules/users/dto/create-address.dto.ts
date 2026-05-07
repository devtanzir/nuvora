import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Tanzir Ibne Ali' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: '01580841070' })
  @IsString()
  phone!: string;

  @ApiProperty({ example: 'House 12, Road 4' })
  @IsString()
  street!: string;

  @ApiProperty({ example: 'Dhaka' })
  @IsString()
  city!: string;

  @ApiProperty({ example: 'Dhaka' })
  @IsString()
  district!: string;

  @ApiProperty({ example: '1216' })
  @IsString()
  postalCode!: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
