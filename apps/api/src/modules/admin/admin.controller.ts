import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ============================================================
  // Dashboard
  // ============================================================

  @Get('dashboard/overview')
  @ApiOperation({ summary: 'Summary stats cards' })
  async getOverview() {
    const data = await this.adminService.getOverview();
    return { data };
  }

  @Get('dashboard/revenue')
  @ApiOperation({ summary: 'Revenue chart data' })
  async getRevenue(@Query('period') period?: string) {
    const data = await this.adminService.getRevenue(period);
    return { data };
  }

  @Get('dashboard/recent-orders')
  @ApiOperation({ summary: 'Recent orders list' })
  async getRecentOrders(@Query('limit') limit?: number) {
    const data = await this.adminService.getRecentOrders(
      limit ? Number(limit) : 10,
    );
    return { data };
  }

  @Get('dashboard/low-stock')
  @ApiOperation({ summary: 'Low stock alerts' })
  async getLowStock(
    @Query('threshold') threshold?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const data = await this.adminService.getLowStock(
      threshold ? Number(threshold) : 10,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
    return { data };
  }

  @Get('dashboard/best-sellers')
  @ApiOperation({ summary: 'Best selling products' })
  async getBestSellers(
    @Query('limit') limit?: number,
    @Query('period') period?: string,
  ) {
    const data = await this.adminService.getBestSellers(
      limit ? Number(limit) : 10,
      period ?? '30d',
    );
    return { data };
  }

  // ============================================================
  // Users
  // ============================================================

  @Get('users')
  @ApiOperation({ summary: 'All users list' })
  async getUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    const data = await this.adminService.getUsers(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      search,
      isActive,
    );
    return { data };
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'User detail + orders' })
  async getUserDetail(@Param('id') userId: string) {
    const data = await this.adminService.getUserDetail(userId);
    return { data };
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Activate/deactivate user' })
  async updateUserStatus(
    @Param('id') userId: string,
    @Body() body: { isActive: boolean },
  ) {
    const data = await this.adminService.updateUserStatus(userId, body.isActive);
    const message = body.isActive
      ? 'User activated successfully'
      : 'User deactivated successfully';
    return { message, data };
  }
}
