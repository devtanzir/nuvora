import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {

    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('POSTGRESQL || CONNECTED || SUCCESS');
    } catch (error) {
      this.logger.error('POSTGRESQL || FAILED TO CONNECT || ERROR', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('POSTGRESQL || DISCONNECTED || SUCCESS');
    } catch (error) {
      this.logger.error('POSTGRESQL || FAILED TO DISCONNECT || ERROR', error);
    }
  }
}
