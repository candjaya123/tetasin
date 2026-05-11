import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

@Injectable()
export class SupabaseService implements OnModuleInit, OnModuleDestroy {
  private supabaseClient: SupabaseClient;
  private pool: Pool;

  onModuleInit() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const dbUrl = process.env.DATABASE_URL;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or Service Role Key is missing in environment variables');
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseKey);

    if (dbUrl) {
      this.pool = new Pool({
        connectionString: dbUrl,
      });
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  getPool(): Pool {
    return this.pool;
  }
}
