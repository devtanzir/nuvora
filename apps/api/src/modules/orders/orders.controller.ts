import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderStatus, Role } from '@prisma/client';
import type { Request, Response } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RefundRequestDto } from './dto/refund-request.dto';
import { ProcessRefundDto } from './dto/process-refund.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ValidatePromoCodeDto } from '../promo-codes/dto/validate-promo-code.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ============================================================
  // Stripe Webhook - Public
  // ============================================================

  @Post('stripe-webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.ordersService.handleWebhook(req.rawBody!, signature);
  }

  // ============================================================
  // Protected Routes
  // ============================================================

  @Post('create-payment-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create Stripe payment intent' })
  async createPaymentIntent(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePaymentIntentDto,
  ) {
    const data = await this.ordersService.createPaymentIntent(userId, dto);
    return { data };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Place new order' })
  async createOrder(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    const data = await this.ordersService.createOrder(userId, dto);
    return { message: 'Order placed successfully', data };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get own order history' })
  async getOrders(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: OrderStatus,
  ) {
    const data = await this.ordersService.getOrders(
      userId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      status,
    );
    return { data };
  }

  @Get(':id/invoice')
  @UseGuards(JwtAuthGuard)
  async downloadInvoice(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.ordersService.generateInvoice(userId, orderId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${orderId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get order detail' })
  async getOrderDetail(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
  ) {
    const data = await this.ordersService.getOrderDetail(userId, orderId);
    return { data };
  }

  @Post('validate-promo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate promo code' })
  async validatePromo(@Body() dto: ValidatePromoCodeDto) {
    const data = await this.ordersService.validatePromoCode(dto);
    return { data };
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel order' })
  async cancelOrder(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
  ) {
    return this.ordersService.cancelOrder(userId, orderId);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Request refund' })
  async requestRefund(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
    @Body() dto: RefundRequestDto,
  ) {
    const data = await this.ordersService.requestRefund(userId, orderId, dto);
    return { message: 'Refund request submitted', data };
  }

  // ============================================================
  // Admin Routes
  // ============================================================

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all orders - Admin only' })
  async adminGetOrders(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: OrderStatus,
    @Query('search') search?: string,
  ) {
    const data = await this.ordersService.adminGetOrders(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      status,
      search,
    );
    return { data };
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update order status - Admin only' })
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const data = await this.ordersService.updateOrderStatus(orderId, dto);
    return { message: 'Order status updated', data };
  }

  @Post('admin/:id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Process refund - Admin only' })
  async processRefund(
    @Param('id') orderId: string,
    @Body() dto: ProcessRefundDto,
  ) {
    const data = await this.ordersService.processRefund(orderId, dto);
    return { message: 'Refund processed successfully', data };
  }
}
