import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'cuid' })
  @IsString()
  addressId!: string;

  @ApiPropertyOptional({ example: 'SAVE20' })
  @IsOptional()
  @IsString()
  promoCode?: string;

  @ApiProperty({ example: 'pi_xxx' })
  @IsString()
  stripePaymentId!: string;
}
