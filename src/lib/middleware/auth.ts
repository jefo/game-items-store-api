import { Elysia } from "elysia";
import { Container } from "ts-ioc-container";
import { SessionManagerType } from "../../features/auth";
import { AuthenticationError } from "../errors";
import { container } from "../../container";
import { ISessionManager } from "../auth/redis-session";

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
        "sessionManager",
        pluginContainer.resolve<ISessionManager>(SessionManagerType)
      )
      .derive(
        async ({
          request,
          cookie: { session },
          sessionManager,
        }) => {
          // Skip auth check for excluded paths
          if (excludePaths.some((path) => request.url.endsWith(path))) {
            return {};
          }

          if (!session?.value) {
            throw new AuthenticationError("No session provided");
          }

          const currentSession = await sessionManager.getSession(session.value);
          if (!currentSession) {
            throw new AuthenticationError("Invalid session");
          }

          // Refresh session TTL after successful validation
          await sessionManager.refreshSession(session.value);

          return {
            user: {
              id: currentSession.userId,
              username: currentSession.username,
            },
          };
        }
      );
};
