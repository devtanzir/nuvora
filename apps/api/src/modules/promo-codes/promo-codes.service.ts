import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DiscountType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { ValidatePromoCodeDto } from './dto/validate-promo-code.dto';

@Injectable()
export class PromoCodesService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // Validate Promo Code (Public)
  // ============================================================

  async validate(dto: ValidatePromoCodeDto) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: dto.code },
    });

    if (!promo) throw new NotFoundException('Promo code not found');
    if (!promo.isActive) throw new BadRequestException('Promo code is inactive');
    if (promo.expiresAt && promo.expiresAt < new Date()) {
      throw new BadRequestException('Promo code expired');
    }
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      throw new BadRequestException('Usage limit reached');
    }

    const discountAmount =
      promo.discountType === DiscountType.PERCENTAGE
        ? (dto.subtotal * promo.discountValue) / 100
        : promo.discountValue;

    const finalTotal = Math.max(0, dto.subtotal - discountAmount);

    return {
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount,
      finalTotal,
    };
  }

  // ============================================================
  // Get All Promo Codes (Admin)
  // ============================================================

  async findAll(page: number = 1, limit: number = 20, isActive?: boolean) {
    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;

    const [promoCodes, total] = await Promise.all([
      this.prisma.promoCode.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.promoCode.count({ where }),
    ]);

    return {
      promoCodes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================================
  // Create Promo Code (Admin)
  // ============================================================

  async create(dto: CreatePromoCodeDto) {
    const existing = await this.prisma.promoCode.findUnique({
      where: { code: dto.code },
    });

    if (existing) throw new BadRequestException('Promo code already exists');

    if (dto.expiresAt && new Date(dto.expiresAt) < new Date()) {
      throw new BadRequestException('Expiry date must be in the future');
    }

    if (dto.discountType === DiscountType.PERCENTAGE && dto.discountValue > 100) {
      throw new BadRequestException('PERCENTAGE discount cannot exceed 100');
    }

    const promo = await this.prisma.promoCode.create({
      data: {
        code: dto.code,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        usageLimit: dto.usageLimit,
        isActive: dto.isActive ?? true,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
      select: {
        id: true,
        code: true,
        discountType: true,
        discountValue: true,
      },
    });

    return promo;
  }

  // ============================================================
  // Update Promo Code (Admin)
  // ============================================================

  async update(id: string, dto: UpdatePromoCodeDto) {
    const promo = await this.prisma.promoCode.findUnique({ where: { id } });

    if (!promo) throw new NotFoundException('Promo code not found');

    if (dto.expiresAt && new Date(dto.expiresAt) < new Date()) {
      throw new BadRequestException('Expiry date must be in the future');
    }

    const updated = await this.prisma.promoCode.update({
      where: { id },
      data: {
        ...(dto.usageLimit !== undefined && { usageLimit: dto.usageLimit }),
        ...(dto.expiresAt && { expiresAt: new Date(dto.expiresAt) }),
      },
      select: {
        id: true,
        usageLimit: true,
        expiresAt: true,
      },
    });

    return updated;
  }

  // ============================================================
  // Toggle Promo Code (Admin)
  // ============================================================

  async toggle(id: string) {
    const promo = await this.prisma.promoCode.findUnique({ where: { id } });

    if (!promo) throw new NotFoundException('Promo code not found');

    const updated = await this.prisma.promoCode.update({
      where: { id },
      data: { isActive: !promo.isActive },
      select: {
        id: true,
        code: true,
        isActive: true,
      },
    });

    return updated;
  }

  // ============================================================
  // Delete Promo Code (Admin)
  // ============================================================

  async delete(id: string) {
    const promo = await this.prisma.promoCode.findUnique({ where: { id } });

    if (!promo) throw new NotFoundException('Promo code not found');

    if (promo.usageCount > 0) {
      throw new BadRequestException('Cannot delete promo code that has been used');
    }

    await this.prisma.promoCode.delete({ where: { id } });

    return { message: 'Promo code deleted successfully' };
  }
}
