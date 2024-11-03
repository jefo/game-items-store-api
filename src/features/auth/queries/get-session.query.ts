import { key, provider, register, singleton } from "ts-ioc-container";
import { IQuery } from "../../../lib/cqrs";
import { GetSessionQueryType } from "./types";
import { redisClient, getSessionKey, Session } from "../redis-config";

export interface GetSessionDto {
    sessionId: string;
}

@register(key(GetSessionQueryType))
@provider(singleton())
export class GetSessionQuery implements IQuery<GetSessionDto, Session | null> {
    async execute({ sessionId }: GetSessionDto): Promise<Session | null> {
        const data = await redisClient.get(getSessionKey(sessionId));
        if (!data) return null;
        
        return JSON.parse(data) as Session;
    }
}

export { GetSessionQueryType };
