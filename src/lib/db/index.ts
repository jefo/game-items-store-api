import { Pool, PoolClient } from "pg";
import { cfg } from "../cfg";

const pool = new Pool({
  user: cfg.postgres.user,
  host: cfg.postgres.host,
  database: cfg.postgres.database,
  password: cfg.postgres.password,
  port: cfg.postgres.port,
});

interface DB {
  query: (text: string, params?: any[]) => Promise<any>;
  getClient: () => Promise<PoolClient>;
}

export const db: DB = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  getClient: () => pool.connect(),
};
