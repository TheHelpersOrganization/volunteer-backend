import { PrismaClient } from '@prisma/client';

export class AppPrismaClient extends PrismaClient {
  private retries = 0;
  private connected = false;

  constructor(private readonly config?: AppPrismaClientConfig) {
    super();
  }

  async connect() {
    while (!this.connected) {
      try {
        await this.$connect();
        this.connected = true;
      } catch (err) {
        if (this.retries >= (this.config?.maxRetries ?? 5)) {
          throw err;
        }
        this.retries++;
        console.warn(`Connection failed. Retrying... Attempt ${this.retries}`);
      }
    }
  }
}

export type AppPrismaClientConfig = {
  maxRetries?: number;
};
