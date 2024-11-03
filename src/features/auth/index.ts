import 'reflect-metadata';
import { IContainer, Registration as R } from "ts-ioc-container";
import { LoginCommand, LoginCommandType } from "./commands/login.cmd";
import { ChangePasswordCommand, ChangePasswordCommandType } from "./commands/change-password.cmd";
import { CreateSessionCommand, CreateSessionCommandType } from "./commands/create-session.cmd";
import { DestroySessionCommand, DestroySessionCommandType } from "./commands/destroy-session.cmd";
import { RefreshSessionCommand, RefreshSessionCommandType } from "./commands/refresh-session.cmd";
import { GetSessionQuery, GetSessionQueryType } from "./queries/get-session.query";

export function bindAuthModule(container: IContainer) {
  // Register commands
  container.add(R.fromClass(LoginCommand).to(LoginCommandType));
  container.add(R.fromClass(ChangePasswordCommand).to(ChangePasswordCommandType));
  container.add(R.fromClass(CreateSessionCommand).to(CreateSessionCommandType));
  container.add(R.fromClass(DestroySessionCommand).to(DestroySessionCommandType));
  container.add(R.fromClass(RefreshSessionCommand).to(RefreshSessionCommandType));

  // Register queries
  container.add(R.fromClass(GetSessionQuery).to(GetSessionQueryType));
}

// Export types and interfaces
export type { LoginDto, LoginResult } from './commands/login.cmd';
export type { ChangePasswordDto } from './commands/change-password.cmd';
export type { CreateSessionDto } from './commands/create-session.cmd';
export type { Session } from './redis-config';
export {
  LoginCommandType,
  ChangePasswordCommandType,
  CreateSessionCommandType,
  DestroySessionCommandType,
  RefreshSessionCommandType
} from './commands/types';
export { GetSessionQueryType } from './queries/types';
