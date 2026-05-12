import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefundRequestDto {
  @ApiProperty({ example: 'Product received was damaged' })
  @IsString()
  reason!: string;
}
