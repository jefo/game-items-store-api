import { Elysia, t } from "elysia";
import { ICmd } from "../lib/cqrs";
import {
  LoginCommandType,
  ChangePasswordCommandType,
  LoginDto,
  LoginResult,
  ChangePasswordDto,
  SessionManagerType,
} from "../features/auth";
import { auth } from "../lib/middleware/auth";
import { ISessionManager } from "../lib/auth/redis-session";
import { Container } from "ts-ioc-container";
import { AuthenticationError, ValidationError } from "../lib/errors";

export const authController = (container: Container) =>
  new Elysia({ prefix: "/api/auth" })
    .use(auth({ excludePaths: ["/api/auth/login"] }))
    .decorate(
      "loginCommand",
      container.resolve<ICmd<LoginDto, LoginResult>>(LoginCommandType)
    )
    .decorate(
      "changePasswordCommand",
      container.resolve<ICmd<ChangePasswordDto, void>>(
        ChangePasswordCommandType
      )
    )
    .decorate(
      "sessionManager",
      container.resolve<ISessionManager>(SessionManagerType)
    )
    .post(
      "/login",
      async ({
        body,
        cookie: { sessionId },
        loginCommand,
        sessionManager,
        set,
      }) => {
        try {
          const result = await loginCommand.execute(body);

          // Create session
          const sid = await sessionManager.createSession(
            result.userId,
            result.username
          );

          // Set session cookie using Elysia's cookie API
          sessionId.value = sid;
          sessionId.httpOnly = true;
          sessionId.secure = process.env.NODE_ENV !== "test";
          sessionId.sameSite = "lax";
          sessionId.maxAge = 24 * 60 * 60;
          sessionId.path = "/";

          return {
            status: "success",
            data: {
              ...result,
              sessionId: sid,
            },
          };
        } catch (error) {
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
        }
      },
      {
        body: t.Object({
          username: t.String(),
          password: t.String(),
        }),
      }
    )
    .post(
      "/change-password",
      async ({ body, changePasswordCommand, user, set }) => {
        try {
          await changePasswordCommand.execute({
            userId: user!.id,
            currentPassword: body.currentPassword,
            newPassword: body.newPassword,
          });

          return {
            status: "success",
          };
        } catch (error) {
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
          if (error instanceof ValidationError) {
            set.status = 400;
            return {
              status: "error",
              error: {
                code: "VALIDATION_ERROR",
                message: error.message,
              },
            };
          }
          throw error;
        }
      },
      {
        body: t.Object({
          currentPassword: t.String(),
          newPassword: t.String(),
        }),
      }
    )
    .post("/logout", async ({ cookie: { sessionId }, sessionManager }) => {
      await sessionManager.destroySession(sessionId.value!);

      // Clear the session cookie using Elysia's cookie API
      sessionId.value = "";
      sessionId.maxAge = 0;
      sessionId.path = "/";

      return {
        status: "success",
      };
    });
