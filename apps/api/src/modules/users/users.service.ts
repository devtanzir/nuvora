import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // Get Profile
  // ============================================================

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  // ============================================================
  // Update Profile
  // ============================================================

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (!dto.name && !dto.avatar) {
      throw new BadRequestException('Name is required');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.avatar && { avatar: dto.avatar }),
      },
      select: {
        id: true,
        name: true,
        avatar: true,
      },
    });

    return user;
  }

  // ============================================================
  // Change Password
  // ============================================================

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new BadRequestException('Current password is incorrect');
    }

    const passwordMatch = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );
    if (!passwordMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    const isSame = await bcrypt.compare(dto.newPassword, user.password);
    if (isSame) {
      throw new BadRequestException('New password same as current');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  // ============================================================
  // Get Addresses
  // ============================================================

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================================================
  // Create Address
  // ============================================================

  async createAddress(userId: string, dto: CreateAddressDto) {
    const count = await this.prisma.address.count({ where: { userId } });

    if (count >= 5) {
      throw new BadRequestException('Maximum 5 addresses allowed');
    }

    const isDefault = count === 0 ? true : (dto.isDefault ?? false);

    if (isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await this.prisma.address.create({
      data: {
        userId,
        fullName: dto.fullName,
        phone: dto.phone,
        street: dto.street,
        city: dto.city,
        district: dto.district,
        postalCode: dto.postalCode,
        isDefault,
      },
      select: {
        id: true,
        fullName: true,
        isDefault: true,
      },
    });

    return address;
  }

  // ============================================================
  // Update Address
  // ============================================================

async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
  const address = await this.prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address) throw new NotFoundException('Address not found');
  if (address.userId !== userId) throw new ForbiddenException('Not your address');

  if (dto.isDefault) {
    await this.prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const updated = await this.prisma.address.update({
    where: { id: addressId },
    data: dto,
    select: {
      id: true,
      street: true,
      postalCode: true,
    },
  });

  return updated;
}

  // ============================================================
  // Delete Address
  // ============================================================

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId)
      throw new ForbiddenException('Not your address');
    if (address.isDefault)
      throw new BadRequestException('Cannot delete default address');

    await this.prisma.address.delete({ where: { id: addressId } });

    return { message: 'Address deleted successfully' };
  }

  // ============================================================
  // Set Default Address
  // ============================================================

  async setDefaultAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId)
      throw new ForbiddenException('Not your address');

    await this.prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    await this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    return { message: 'Default address updated' };
  }

  // ============================================================
  // Get Reviews
  // ============================================================

  async getMyReviews(userId: string, page: number = 1, limit: number = 10) {
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          rating: true,
          title: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                where: { isPrimary: true },
                select: { url: true },
                take: 1,
              },
            },
          },
        },
      }),
      this.prisma.review.count({ where: { userId } }),
    ]);

    return {
      reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================================
  // Get Notifications
  // ============================================================

  async getNotifications(
    userId: string,
    page: number = 1,
    limit: number = 10,
    unread?: boolean,
  ) {
    const where: any = { userId };
    if (unread !== undefined) where.isRead = !unread;

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      notifications,
      unreadCount,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================================
  // Mark Notification as Read
  // ============================================================

  async markNotificationRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== userId)
      throw new ForbiddenException('Not your notification');

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return { message: 'Notification marked as read' };
  }

  // ============================================================
  // Mark All Notifications as Read
  // ============================================================

  async markAllNotificationsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read' };
  }
}
