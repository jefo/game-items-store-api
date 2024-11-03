import { key, provider, register, singleton } from "ts-ioc-container";
import { ICmd } from "../../../lib/cqrs";
import { RefreshSessionCommandType } from "./types";
import { redisClient, getSessionKey, SESSION_TTL } from "../redis-config";

export interface RefreshSessionDto {
    sessionId: string;
}

@register(key(RefreshSessionCommandType))
@provider(singleton())
export class RefreshSessionCommand implements ICmd<RefreshSessionDto> {
    async execute({ sessionId }: RefreshSessionDto): Promise<void> {
        const exists = await redisClient.exists(getSessionKey(sessionId));
        if (exists) {
            await redisClient.expire(getSessionKey(sessionId), SESSION_TTL);
        }
    }
}

export { RefreshSessionCommandType };
