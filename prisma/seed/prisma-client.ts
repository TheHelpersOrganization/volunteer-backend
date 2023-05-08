import { PrismaClient } from '@prisma/client';

export class SeedPrismaClient extends PrismaClient {
  private retries = 0;
  private connected = false;

  constructor() {
    super();
  }

  async connect() {
    while (!this.connected) {
      try {
        await this.$connect();
        this.connected = true;
      } catch (err) {
        if (this.retries >= 5) {
          throw err;
        }
        this.retries++;
        console.warn(`Connection failed. Retrying... Attempt ${this.retries}`);
      }
    }
  }
}
