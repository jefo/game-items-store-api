import {
  key,
  provider,
  register,
  singleton,
  inject,
  by,
} from "ts-ioc-container";
import { ICmd } from "../../../lib/cqrs";
import { Pool } from "pg";
import { verifyPassword } from "../../../lib/auth/pwd.utils";
import { LoginCommandType } from "./types";
import { AuthenticationError } from "../../../lib/errors";

export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResult {
  userId: number;
  username: string;
  balance: number;
}

@register(key(LoginCommandType))
@provider(singleton())
export class LoginCommand implements ICmd<LoginDto, LoginResult> {
  constructor(@inject(by.key("DbPool")) private db: Pool) {}

  async execute({ username, password }: LoginDto): Promise<LoginResult> {
    console.log("Executing login command for username:", username);

    // Log database connection info
    const pool = this.db as any;
    console.log("Database connection info:", {
      database: pool.options?.database,
      host: pool.options?.host,
      port: pool.options?.port,
      user: pool.options?.user,
    });

    // First verify the database connection
    try {
      const testResult = await this.db.query("SELECT NOW()");
      console.log("Database connection test successful:", testResult.rows[0]);
    } catch (error) {
      console.error("Database connection test failed:", error);
      throw error;
    }

    // Log the SQL query we're about to execute
    const query = {
      text: "SELECT id, username, password_hash, balance FROM users WHERE username = $1",
      values: [username],
    };
    console.log("Executing SQL query:", query);

    const result = await this.db.query(query);
    console.log("Query result:", {
      rowCount: result.rowCount,
      rows: result.rows,
    });

    const user = result.rows[0];

    if (!user) {
      console.log("User not found");
      throw new AuthenticationError("Invalid username or password");
    }

    console.log("Found user:", { id: user.id, username: user.username });
    console.log("Stored hash:", user.password_hash);

    const isValid = await verifyPassword(password, user.password_hash);
    console.log("Password verification result:", isValid);

    if (!isValid) {
      throw new AuthenticationError("Invalid username or password");
    }

    return {
      userId: user.id,
      username: user.username,
      balance: Number(user.balance),
    };
  }
}
