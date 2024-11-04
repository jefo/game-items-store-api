import { key, provider, register, singleton } from "ts-ioc-container";
import { ICmd } from "../../../lib/cqrs";
import { db } from "../../../lib/db";
import { verifyPassword } from "../../../lib/auth/pwd.utils";
import { LoginCommandType } from "./types";

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
    async execute({ username, password }: LoginDto): Promise<LoginResult> {
        const result = await db.query(
            'SELECT id, username, password_hash, balance FROM users WHERE username = $1',
            [username]
        );
        const user = result.rows[0];

        if (!user || !(await verifyPassword(password, user.password_hash))) {
            throw new Error('Invalid username or password');
        }

        return {
            userId: user.id,
            username: user.username,
            balance: Number(user.balance)
        };
    }
}
