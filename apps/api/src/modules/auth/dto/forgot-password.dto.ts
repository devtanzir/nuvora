import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'tanziribneali@gmail.com' })
  @IsEmail()
  email: string;
}
