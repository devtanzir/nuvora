import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class ProcessRefundDto {
  @ApiPropertyOptional({ example: 'cuid' })
  @IsOptional()
  @IsString()
  refundRequestId?: string;

  @ApiProperty({ enum: ['APPROVE', 'REJECT'], example: 'APPROVE' })
  @IsEnum(['APPROVE', 'REJECT'])
  action!: 'APPROVE' | 'REJECT';

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  restock?: boolean;

  @ApiPropertyOptional({ type: [String], example: ['orderItemId1'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restockItems?: string[];
}
