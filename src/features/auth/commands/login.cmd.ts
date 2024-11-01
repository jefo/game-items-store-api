import { key, provider, register, singleton } from "ts-ioc-container";
import { ICmd } from "../../../lib/cqrs";
import { db } from "../../../lib/db";
import { PasswordManager } from "../../../lib/auth/password";
import { sessionManager } from "../../../lib/auth/redis-session";
import { LoginCommandType } from "./types";

export interface LoginDto {
    username: string;
    password: string;
}

export interface LoginResult {
    sessionId: string;
    username: string;
    balance: number;
}

@register(key(LoginCommandType))
@provider(singleton())
export class LoginCommand implements ICmd<LoginDto, LoginResult> {
    async execute({ username, password }: LoginDto): Promise<LoginResult> {
        const result = await db.query(
            'SELECT id, username, password_hash, balance FROM users WHERE username = $1',
            [username]
        );
        const user = result.rows[0];

        if (!user || !(await PasswordManager.verify(password, user.password_hash))) {
            throw new Error('Invalid username or password');
        }

        const sessionId = await sessionManager.createSession(user.id, user.username);

        return {
            sessionId,
            username: user.username,
            balance: Number(user.balance)
        };
    }
}

export { LoginCommandType };
