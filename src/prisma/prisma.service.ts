import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { AppLogger } from '../common/logger';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private retries = 0;
  private connected = false;

  constructor(private readonly logger: AppLogger) {
    super();
    logger.setContext(PrismaService.name);
  }

  async onModuleInit() {
    while (!this.connected) {
      try {
        await this.$connect();
        this.connected = true;
      } catch (err) {
        if (this.retries >= 5) {
          throw err;
        }
        this.retries++;
        this.logger.warn(
          null,
          `Connection failed. Retrying... Attempt ${this.retries}`,
        );
      }
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
