import { Pool, PoolClient } from 'pg';

export interface DB {
  query: (text: string, params?: any[]) => Promise<any>;
  getClient: () => Promise<PoolClient>;
}

export const db: DB;
