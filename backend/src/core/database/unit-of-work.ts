import { Injectable, Logger } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';

@Injectable()
export class UnitOfWork {
  private readonly logger = new Logger(UnitOfWork.name);
  public pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async runInTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error(`Transaction failed, rolled back: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }
}
