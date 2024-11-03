import { key, provider, register, singleton } from "ts-ioc-container";
import { ICmd } from "../../../lib/cqrs";
import { CreateSessionCommandType } from "./types";
import { redisClient, getSessionKey, SESSION_TTL } from "../redis-config";

export interface CreateSessionDto {
    userId: number;
    username: string;
}

@register(key(CreateSessionCommandType))
@provider(singleton())
export class CreateSessionCommand implements ICmd<CreateSessionDto, string> {
    async execute({ userId, username }: CreateSessionDto): Promise<string> {
        const sessionId = crypto.randomUUID();
        const session = { userId, username };
        
        await redisClient.set(
            getSessionKey(sessionId),
            JSON.stringify(session),
            { EX: SESSION_TTL }
        );
        
        return sessionId;
    }
}

export { CreateSessionCommandType };
