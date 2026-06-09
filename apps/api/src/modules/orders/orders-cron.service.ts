import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OrdersService } from './orders.service';

@Injectable()
export class OrdersCronService {
  constructor(private readonly ordersService: OrdersService) {}

  @Cron('*/15 * * * *') // will run every 15 minutes
  async handleExpiredOrders() {
    await this.ordersService.cancelExpiredPendingOrders();
  }
}
