import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
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

@Module({
  imports: [
    // Confirm to load .env file and make env variables globally available
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Rate limiting — DDoS protection
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // max 100 requests per minute
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
  ],
  controllers: [AppController, UploadController],
  providers: [AppService],
})
export class AppModule {}
