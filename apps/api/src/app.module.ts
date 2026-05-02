import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailModule } from './modules/mail/mail.module';

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

    AuthModule,

    MailModule,

    // Feature modules (pore add korbo)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
