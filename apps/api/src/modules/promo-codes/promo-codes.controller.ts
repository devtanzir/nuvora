import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PromoCodesService } from './promo-codes.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { ValidatePromoCodeDto } from './dto/validate-promo-code.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Promo Codes')
@Controller('promo-codes')
export class PromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate promo code' })
  async validate(@Body() dto: ValidatePromoCodeDto) {
    const data = await this.promoCodesService.validate(dto);
    return { data };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all promo codes — Admin only' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isActive') isActive?: boolean,
  ) {
    const data = await this.promoCodesService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      isActive,
    );
    return { data };
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create promo code — Admin only' })
  async create(@Body() dto: CreatePromoCodeDto) {
    const data = await this.promoCodesService.create(dto);
    return { message: 'Promo code created successfully', data };
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update promo code — Admin only' })
  async update(@Param('id') id: string, @Body() dto: UpdatePromoCodeDto) {
    const data = await this.promoCodesService.update(id, dto);
    return { message: 'Promo code updated successfully', data };
  }

  @Patch('admin/:id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle promo code — Admin only' })
  async toggle(@Param('id') id: string) {
    const data = await this.promoCodesService.toggle(id);
    const message = data.isActive ? 'Promo code activated' : 'Promo code deactivated';
    return { message, data };
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete promo code — Admin only' })
  async delete(@Param('id') id: string) {
    return this.promoCodesService.delete(id);
  }
}
