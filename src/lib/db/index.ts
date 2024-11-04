import "reflect-metadata";
import { IContainer, Registration as R } from "ts-ioc-container";
import { Pool } from "pg";
import { cfg } from "../cfg";

class DB {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      user: cfg.postgres.user,
      host: cfg.postgres.host,
      database: cfg.postgres.database,
      password: cfg.postgres.password,
      port: cfg.postgres.port,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
      process.exit(-1);
    });
  }

  async query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }

  async getClient() {
    return await this.pool.connect();
  }

  async end() {
    await this.pool.end();
  }
}

export const db = new DB();

export function bindDbModule(container: IContainer) {
  container.add(R.fromValue(db).to("DB"));
}

export * from "./models";
