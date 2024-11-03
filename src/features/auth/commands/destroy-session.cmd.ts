import { key, provider, register, singleton } from "ts-ioc-container";
import { ICmd } from "../../../lib/cqrs";
import { DestroySessionCommandType } from "./types";
import { redisClient, getSessionKey } from "../redis-config";

export interface DestroySessionDto {
    sessionId: string;
}

@register(key(DestroySessionCommandType))
@provider(singleton())
export class DestroySessionCommand implements ICmd<DestroySessionDto> {
    async execute({ sessionId }: DestroySessionDto): Promise<void> {
        await redisClient.del(getSessionKey(sessionId));
    }
}

export { DestroySessionCommandType };
