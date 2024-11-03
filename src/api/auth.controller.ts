import { Elysia, t } from "elysia";
import { container } from "../container";
import { ICmd, IQuery } from "../lib/cqrs";
import {
  LoginCommandType,
  ChangePasswordCommandType,
  DestroySessionCommandType,
  GetSessionQueryType,
  LoginDto,
  LoginResult,
  ChangePasswordDto,
  Session,
} from "../features/auth";
import { auth, AuthUser } from "../lib/middleware/auth";

interface LoginContext {
  body: LoginDto;
  cookie: {
    session: {
      value: string;
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: string;
      maxAge?: number;
    };
  };
  loginCommand: ICmd<LoginDto, LoginResult>;
}

interface ChangePasswordContext {
  body: ChangePasswordDto;
  cookie: {
    session: {
      value: string;
    };
  };
  changePasswordCommand: ICmd<ChangePasswordDto, void>;
  getSessionQuery: IQuery<{ sessionId: string }, Session | null>;
  user: AuthUser;
}

interface LogoutContext {
  cookie: {
    session: {
      value: string;
      maxAge?: number;
    };
  };
  destroySessionCommand: ICmd<{ sessionId: string }, void>;
  user: AuthUser;
}

export const authController = new Elysia({ prefix: "/api/auth" })
  .use(auth({ excludePaths: ["/api/auth/login"] }))
  .decorate(
    "loginCommand",
    container.resolve<ICmd<LoginDto, LoginResult>>(LoginCommandType)
  )
  .decorate(
    "changePasswordCommand",
    container.resolve<ICmd<ChangePasswordDto, void>>(ChangePasswordCommandType)
  )
  .decorate(
    "destroySessionCommand",
    container.resolve<ICmd<{ sessionId: string }, void>>(
      DestroySessionCommandType
    )
  )
  .decorate(
    "getSessionQuery",
    container.resolve<IQuery<{ sessionId: string }, Session | null>>(
      GetSessionQueryType
    )
  )
  .post(
    "/login",
    async ({ body, cookie: { session }, loginCommand }: LoginContext) => {
      const result = await loginCommand.execute(body);

      // Set session cookie
      session.value = result.sessionId;
      session.httpOnly = true;
      session.secure = process.env.NODE_ENV !== "test";
      session.sameSite = "lax";
      session.maxAge = 24 * 60 * 60;

      return {
        status: "success",
        data: result,
      };
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
    async ({ body, changePasswordCommand, user }: ChangePasswordContext) => {
      await changePasswordCommand.execute({
        userId: user.id,
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      });

      return {
        status: "success",
      };
    },
    {
      body: t.Object({
        currentPassword: t.String(),
        newPassword: t.String(),
      }),
    }
  )
  .post(
    "/logout",
    async ({ cookie: { session }, destroySessionCommand }: LogoutContext) => {
      await destroySessionCommand.execute({ sessionId: session.value });

      // Clear the session cookie
      session.value = "";
      session.maxAge = 0;

      return {
        status: "success",
      };
    }
  );
