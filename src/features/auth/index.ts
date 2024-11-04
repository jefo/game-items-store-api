import "reflect-metadata";
import { IContainer, Registration as R } from "ts-ioc-container";
import { LoginCommand } from "./commands/login.cmd";
import {
  ChangePasswordCommand,
  ChangePasswordCommandType,
} from "./commands/change-password.cmd";
import { RedisSessionManager } from "../../lib/auth/redis-session";
import { SessionManagerType } from "../../lib/auth";
import { LoginCommandType } from "./commands";

export function bindAuthModule(container: IContainer) {
  // Register session manager
  container.add(R.fromClass(RedisSessionManager).to(SessionManagerType));

  // Register commands
  container.add(R.fromClass(LoginCommand).to(LoginCommandType));
  container.add(
    R.fromClass(ChangePasswordCommand).to(ChangePasswordCommandType)
  );
}

// Export types and interfaces
export type { LoginDto, LoginResult } from "./commands/login.cmd";
export type { ChangePasswordDto } from "./commands/change-password.cmd";
export { LoginCommandType, ChangePasswordCommandType, SessionManagerType };
