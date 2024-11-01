import { key, provider, register, singleton } from "ts-ioc-container";
import { IQuery } from "../../../lib/cqrs";
import { sessionManager, Session } from "../../../lib/auth/redis-session";
import { GetSessionQueryType } from "./types";

export interface GetSessionDto {
    sessionId: string;
}

@register(key(GetSessionQueryType))
@provider(singleton())
export class GetSessionQuery implements IQuery<GetSessionDto, Session | null> {
    async execute({ sessionId }: GetSessionDto): Promise<Session | null> {
        return await sessionManager.getSession(sessionId);
    }
}

export { GetSessionQueryType };
