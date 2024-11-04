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
      .derive<{ user?: AuthUser }>(
        async ({
          request,
          cookie: { sessionId },
          sessionManager,
          set,
        }) => {
          // Skip auth check for excluded paths
          if (excludePaths.some((path) => request.url.endsWith(path))) {
            return {};
          }

          // Get session ID from cookie
          const sid = sessionId?.value;
          if (!sid) {
            set.status = 401;
            throw new AuthenticationError("No session provided");
          }

          const currentSession = await sessionManager.getSession(sid);
          if (!currentSession) {
            set.status = 401;
            throw new AuthenticationError("Invalid session");
          }

          // Refresh session TTL after successful validation
          await sessionManager.refreshSession(sid);

          return {
            user: {
              id: currentSession.userId,
              username: currentSession.username,
            },
          };
        }
      )
      .onError(({ error, set }) => {
        if (error instanceof AuthenticationError) {
          set.status = 401;
          return {
            status: "error",
            error: {
              code: "AUTHENTICATION_ERROR",
              message: error.message,
            },
          };
        }
        throw error;
      });
};
