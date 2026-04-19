import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Config — .env load korbe globally
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

    // Feature modules (pore add korbo)
  ],
})
export class AppModule {}
