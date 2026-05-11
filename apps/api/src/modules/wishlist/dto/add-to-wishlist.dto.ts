import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddToWishlistDto {
  @ApiProperty({ example: 'cuid' })
  @IsString()
  productId!: string;
}
