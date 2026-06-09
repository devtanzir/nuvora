import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailModule } from './modules/mail/mail.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { CartModule } from './modules/cart/cart.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { UploadController } from './modules/upload/upload.controller';
import { UploadModule } from './modules/upload/upload.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { PromoCodesModule } from './modules/promo-codes/promo-codes.module';
import { OrdersModule } from './modules/orders/orders.module';
import { BannersModule } from './modules/banners/banners.module';
import { AdminModule } from './modules/admin/admin.module';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core/constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,       // 1 minute
        limit: 100,       // 100 requests per minute per IP
      },
    ]),

    // Database
    PrismaModule,
    AuthModule,
    MailModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    WishlistModule,
    UploadModule,
    ReviewsModule,
    PromoCodesModule,
    OrdersModule,
    BannersModule,
    AdminModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController, UploadController],
  providers: [
        {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,   // global guard
    },
    AppService],
})
export class AppModule {}
