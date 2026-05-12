import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ReorderBannersDto } from './dto/reorder-banners.dto';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // Get Active Banners (Public)
  // ============================================================

  async getActiveBanners() {
    return this.prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        linkUrl: true,
        order: true,
      },
    });
  }

  // ============================================================
  // Get All Banners (Admin)
  // ============================================================

  async findAll() {
    return this.prisma.banner.findMany({
      orderBy: { order: 'asc' },
    });
  }

  // ============================================================
  // Create Banner (Admin)
  // ============================================================

  async create(dto: CreateBannerDto) {
    const banner = await this.prisma.banner.create({
      data: {
        title: dto.title,
        imageUrl: dto.imageUrl,
        linkUrl: dto.linkUrl,
        order: dto.order ?? 0,
        isActive: dto.isActive ?? true,
      },
      select: {
        id: true,
        title: true,
        order: true,
      },
    });

    return banner;
  }

  // ============================================================
  // Update Banner (Admin)
  // ============================================================

  async update(id: string, dto: UpdateBannerDto) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });

    if (!banner) throw new NotFoundException('Banner not found');

    const updated = await this.prisma.banner.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        title: true,
        isActive: true,
      },
    });

    return updated;
  }

  // ============================================================
  // Delete Banner (Admin)
  // ============================================================

  async delete(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });

    if (!banner) throw new NotFoundException('Banner not found');

    await this.prisma.banner.delete({ where: { id } });

    return { message: 'Banner deleted successfully' };
  }

  // ============================================================
  // Reorder Banners (Admin)
  // ============================================================

  async reorder(dto: ReorderBannersDto) {
    await Promise.all(
      dto.banners.map((item) =>
        this.prisma.banner.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    return { message: 'Banners reordered successfully' };
  }
}
