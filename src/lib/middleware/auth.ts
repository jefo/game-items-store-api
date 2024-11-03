import { Elysia } from "elysia";
import { Container } from "ts-ioc-container";
import {
  GetSessionQueryType,
  RefreshSessionCommandType,
  Session,
} from "../../features/auth";
import { ICmd, IQuery } from "../cqrs";
import { AuthenticationError } from "../errors";
import { container } from "../../container";

export interface AuthUser {
  id: number;
  username: string;
}

export interface AuthPluginConfig {
  container?: Container;
  excludePaths?: string[];
}

export const auth = (config: AuthPluginConfig = {}) => {
  const pluginContainer = config.container || container;
  const excludePaths = config.excludePaths || ["/api/auth/login"];

  return (app: Elysia) =>
    app
      .decorate(
        "getSessionQuery",
        pluginContainer.resolve<IQuery<{ sessionId: string }, Session | null>>(
          GetSessionQueryType
        )
      )
      .decorate(
        "refreshSessionCommand",
        pluginContainer.resolve<ICmd<{ sessionId: string }, void>>(
          RefreshSessionCommandType
        )
      )
      .derive(
        async ({
          request,
          cookie: { session },
          getSessionQuery,
          refreshSessionCommand,
        }) => {
          // Skip auth check for excluded paths
          if (excludePaths.some((path) => request.url.endsWith(path))) {
            return {};
          }

          if (!session?.value) {
            throw new AuthenticationError("No session provided");
          }

          const currentSession = await getSessionQuery.execute({
            sessionId: session.value,
          });
          if (!currentSession) {
            throw new AuthenticationError("Invalid session");
          }

          // Refresh session TTL after successful validation
          await refreshSessionCommand.execute({ sessionId: session.value });

          return {
            user: {
              id: currentSession.userId,
              username: currentSession.username,
            },
          };
        }
      );
};
