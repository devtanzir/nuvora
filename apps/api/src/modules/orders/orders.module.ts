import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { OrdersCronService } from './orders-cron.service';
import { InvoiceService } from './invoice.service';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersCronService, InvoiceService ],
  exports: [OrdersService],
})
export class OrdersModule {}
