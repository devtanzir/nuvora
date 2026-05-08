import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ============================================================
  // Profile
  // ============================================================

  @Get('profile')
  @ApiOperation({ summary: 'Get own profile' })
  async getProfile(@CurrentUser('id') userId: string) {
    const data = await this.usersService.getProfile(userId);
    return { data };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update own profile' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    const data = await this.usersService.updateProfile(userId, dto);
    return { message: 'Profile updated successfully', data };
  }

  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, dto);
  }

  // ============================================================
  // Addresses
  // ============================================================

  @Get('addresses')
  @ApiOperation({ summary: 'Get all addresses' })
  async getAddresses(@CurrentUser('id') userId: string) {
    const data = await this.usersService.getAddresses(userId);
    return { data };
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Add new address' })
  async createAddress(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    const data = await this.usersService.createAddress(userId, dto);
    return { message: 'Address added successfully', data };
  }

  @Patch('addresses/:id')
  @ApiOperation({ summary: 'Update address' })
  async updateAddress(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    const data = await this.usersService.updateAddress(userId, addressId, dto);
    return { message: 'Address updated successfully', data };
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Delete address' })
  async deleteAddress(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
  ) {
    return this.usersService.deleteAddress(userId, addressId);
  }

  @Patch('addresses/:id/default')
  @ApiOperation({ summary: 'Set default address' })
  async setDefaultAddress(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
  ) {
    return this.usersService.setDefaultAddress(userId, addressId);
  }

  // ============================================================
  // Reviews
  // ============================================================

  @Get('reviews')
  @ApiOperation({ summary: 'Get own reviews' })
  async getMyReviews(
    @CurrentUser('id') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const data = await this.usersService.getMyReviews(userId, page, limit);
    return { data };
  }

  // ============================================================
  // Notifications
  // ============================================================

  @Get('notifications')
  @ApiOperation({ summary: 'Get notifications' })
  async getNotifications(
    @CurrentUser('id') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('unread') unread?: boolean,
  ) {
    const data = await this.usersService.getNotifications(
      userId,
      page,
      limit,
      unread,
    );
    return { data };
  }

  @Patch('notifications/read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllNotificationsRead(@CurrentUser('id') userId: string) {
    return this.usersService.markAllNotificationsRead(userId);
  }

  @Patch('notifications/:id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  async markNotificationRead(
    @CurrentUser('id') userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.usersService.markNotificationRead(userId, notificationId);
  }
}
