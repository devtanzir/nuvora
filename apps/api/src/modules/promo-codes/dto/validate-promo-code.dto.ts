import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class ValidatePromoCodeDto {
  @ApiProperty({ example: 'SAVE20' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 3000 })
  @IsNumber()
  @Min(0)
  subtotal!: number;
}
